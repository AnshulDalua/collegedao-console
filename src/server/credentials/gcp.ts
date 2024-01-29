import { IAMCredentialsClient } from "@google-cloud/iam-credentials";
import { ServiceUsageClient } from "@google-cloud/service-usage";
import { google } from "googleapis";
import get from "lodash/get";
import { match, P } from "ts-pattern";
import { z } from "zod";

import { env } from "@/env.mjs";
import { GCPOAuth } from "@/pages/api/project/credentials/gcp/callback";
import { updateCredentials } from "@/server/credentials";
import { getCredentials as getCredentialsFromDB } from "@/server/db/relations";
import { inngestInfra } from "@/server/inngest";
import Data from "@/server/util/data";
import { emit } from "@/server/util/emit";
import { KnownError } from "@/utils/error";
import { rhoIdGenerator } from "@/utils/id";
import raise from "@/utils/raise";

export interface GCPCredentials {
  gcp: {
    GOOGLE_CREDENTIALS: string;
    GOOGLE_PROJECT: string;
  };
}

export interface Credentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

// Generates temporary credentials for a GCP project using the provided credentials.
export async function generateTemporaryCredentials(
  credentials: GCPCredentials,
  _: string
) {
  try {
    const parsedCredentials = JSON.parse(
      credentials.gcp.GOOGLE_CREDENTIALS
    ) as Credentials;

    // Ensure IAM Service is enabled for this project
    // Although the operation is waiting for the service to be enabled, it is not
    // guaranteed that generating the token will work right after the operation.
    // This service should also be enabled by gcp::setup on infra side.
    const serviceUsageClient = new ServiceUsageClient({
      credentials: parsedCredentials,
    });

    const [operation] = await serviceUsageClient.enableService({
      name: `projects/${parsedCredentials.project_id}/services/iamcredentials.googleapis.com`,
    });

    const [_] = await operation.promise();

    // Create temporary credentials for this project
    const client = new IAMCredentialsClient({
      credentials: parsedCredentials,
    });

    const [token] = await client.generateAccessToken({
      name: `projects/-/serviceAccounts/${parsedCredentials.client_email}`,
      scope: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    if (!token || !token.accessToken)
      raise("Failed to get temporary credentials");

    const tokenExtended = {
      accessToken: token.accessToken,
      expires_in: token.expireTime?.seconds,
      project_id: parsedCredentials.project_id,
    };

    return tokenExtended;
  } catch (e: any) {
    const sht = P.string.includes;
    return match(e)
      .with(sht("Request had insufficient authentication scopes"), () =>
        raise("Invalid GCP credentials")
      )
      .with(sht("Request had invalid authentication credentials"), () =>
        raise("Invalid GCP credentials")
      )
      .with(
        sht("IAM Service Account Credentials API has not been used in"),
        () => raise("IAM Service has not been enabled for this project")
      )
      .otherwise(() => null);
  }
}

// Validates the provided credentials.
export async function checkGCPCredentials(
  credentials: GCPCredentials,
  _: string
) {
  try {
    const cred = JSON.parse(credentials.gcp.GOOGLE_CREDENTIALS) as Credentials;

    const client = new ServiceUsageClient({
      credentials: cred,
    });

    await client.getService({
      name: `projects/${cred.project_id}/services/iamcredentials.googleapis.com`,
    });
  } catch {
    raise("Invalid GCP credentials");
  }
}

// Enables the GCP services for the provided project for Rocetta to work.
export async function setupGCPServices(projectId: string, userId: string) {
  const stackId = rhoIdGenerator();
  const config = {
    rocettaConfig: {
      projectId: projectId,
    },
  };
  await inngestInfra.send({
    id: `stack-create-${stackId}`,
    name: "infra/stack.create",
    data: {
      type: "setup",
      provider: "gcp",
      inputs: config,
      stackId: stackId,
      projectId: projectId,
      userId: userId,
      configs: [],
      program: "" as any,
      rocettaConfig: config.rocettaConfig,
    },
    user: { external_id: userId },
  });
}

export async function createGCPServiceAccount(
  projectId: string,
  userId: string,
  gcpProject: string // i.e "projects/rocetta-1"
) {
  const iam = google.iam("v1");
  const cloudresourcemanager = google.cloudresourcemanager("v3");

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET
  );

  const oauthHandler = new Data<z.infer<typeof GCPOAuth>>(
    "gcp",
    "oauth",
    projectId
  ).addZod(GCPOAuth);

  const tokens = await oauthHandler.get();
  if (!tokens) throw new KnownError("Invalid OAuth tokens");

  oauth2Client.setCredentials(tokens.oauth);

  /** Create a Service Account */
  const { data: createServiceAccount } =
    await iam.projects.serviceAccounts.create({
      name: gcpProject,
      requestBody: {
        accountId: rhoIdGenerator(),
        serviceAccount: {
          displayName: "Rocetta User Service Account",
          description:
            "Rocetta will use this service account to help you provision & manage your infrastructure. You can delete this service account any time to revoke Rocetta's access to your GCP Account.",
        },
      },
      auth: oauth2Client,
    });

  /** Grab existing policy of project */
  const { data: getIamPolicy } =
    await cloudresourcemanager.projects.getIamPolicy({
      resource: gcpProject,
      requestBody: {},
      auth: oauth2Client,
    });

  if (!getIamPolicy.bindings) throw new KnownError("No bindings found");

  const ownerRolesBindings = getIamPolicy.bindings.find(
    (binding) => binding.role === "roles/owner"
  );

  if (!ownerRolesBindings) {
    throw new KnownError("No owner bindings found");
  }

  /* Update policy to include new service account */
  (ownerRolesBindings.members ?? []).push(
    `serviceAccount:${createServiceAccount.email}`
  );

  await cloudresourcemanager.projects.setIamPolicy({
    resource: gcpProject,
    requestBody: {
      policy: {
        bindings: [ownerRolesBindings],
      },
    },
    auth: oauth2Client,
  });

  /* Create a key for the service account */
  if (!createServiceAccount.name)
    throw new KnownError("No service account name");
  const { data: createKey } = await iam.projects.serviceAccounts.keys.create({
    name: createServiceAccount.name,
    requestBody: {},
    auth: oauth2Client,
  });

  if (!createKey.privateKeyData)
    throw new KnownError("No private key data found");

  // Decode the private key data
  const privateKeyData = Buffer.from(
    createKey.privateKeyData,
    "base64"
  ).toString();

  await updateCredentials(projectId, userId, {
    gcp: {
      GOOGLE_CREDENTIALS: privateKeyData,
      GOOGLE_PROJECT: gcpProject.replace("projects/", ""),
    },
  });

  await oauthHandler.delete();

  await emit(projectId, "gcp_handshake_completed");

  return {
    serviceAccount: createServiceAccount,
    key: privateKeyData,
  };
}

export async function createGCPAccount(projectName: string, projectId: string) {
  const cloudresourcemanager = google.cloudresourcemanager("v3");

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET
  );

  const oauthHandler = new Data<z.infer<typeof GCPOAuth>>(
    "gcp",
    "oauth",
    projectId
  ).addZod(GCPOAuth);

  const tokens = await oauthHandler.get();
  if (!tokens) throw new KnownError("Invalid OAuth tokens");

  oauth2Client.setCredentials(tokens.oauth);

  /** Create a GCP Cloud Account
   * TODO: Error handling */
  const gcpProjectId = rhoIdGenerator();

  await cloudresourcemanager.projects.create({
    requestBody: {
      displayName: `rocetta-${projectName}`,
      projectId: gcpProjectId,
    },
    auth: oauth2Client,
  });

  return gcpProjectId;
}

export async function getGCPCredentials(projectId: string, userId: string) {
  const credentials = await getCredentialsFromDB(projectId, userId);
  if (!credentials) raise("Credentials not found");
  try {
    const parsedCredentials = JSON.parse(
      get(credentials.contents, "gcp.GOOGLE_CREDENTIALS") ?? ""
    ) as Credentials;
    return parsedCredentials;
  } catch {
    raise("Failed to grab GCP Credentials");
  }
}

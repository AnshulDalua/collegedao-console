import {
  GetCallerIdentityCommand,
  GetFederationTokenCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { z } from "zod";

import { AWSCrendentials } from "@/pages/api/project/billing/aws";
import { getCredentials as getCredentialsFromDB } from "@/server/db/relations";
import raise from "@/utils/raise";

export async function checkAWSCredentials(
  credentials: z.infer<typeof AWSCrendentials>,
  _: string
) {
  const client = new STSClient({
    credentials: {
      accessKeyId: credentials.aws.AWS_ACCESS_KEY_ID,
      secretAccessKey: credentials.aws.AWS_SECRET_ACCESS_KEY,
    },
  });

  const response = await client
    .send(new GetCallerIdentityCommand({}))
    .catch((e) => {
      if (e.name === "InvalidClientTokenId") raise("Invalid AWS credentials");
    });

  return response?.UserId ?? raise("Failed to get temporary credentials");
}

export async function generateTemporaryCredentials(
  credentials: z.infer<typeof AWSCrendentials>,
  projectId: string
) {
  const client = new STSClient({
    credentials: {
      accessKeyId: credentials.aws.AWS_ACCESS_KEY_ID,
      secretAccessKey: credentials.aws.AWS_SECRET_ACCESS_KEY,
    },
  });

  const response = await client
    .send(
      new GetFederationTokenCommand({
        Name: "rocetta-temporary",
        PolicyArns: [{ arn: "arn:aws:iam::aws:policy/PowerUserAccess" }],
        DurationSeconds: 3600,
        Tags: [
          {
            Key: "rocetta:managedBy",
            Value: "rocetta",
          },
          {
            Key: "rocetta:projectId",
            Value: projectId,
          },
        ],
      })
    )
    .catch((e) => {
      if (e.name === "InvalidClientTokenId") raise("Invalid AWS credentials");
    });

  return response?.Credentials ?? raise("Failed to get temporary credentials");
}

export async function getAWSCredentials(projectId: string, userId: string) {
  const credentials = await getCredentialsFromDB(projectId, userId);
  if (!credentials) raise("Credentials not found");
  const aws = AWSCrendentials.safeParse(credentials.contents);

  if (!aws.success) raise("Failed to grab AWS Credentials");

  return aws.data.aws;
}
import { toast } from "sonner";

import { wretchClient } from "@/hooks/Wretch";
import { useAccountStore } from "@/stores/account";

import { KnownError } from "./error";

import type { Response as AWSSetupResponse } from "@/pages/api/project/billing/aws/setup";
import type { Response as ProjectCreateResponse } from "@/pages/api/project/create";
import type { Response as CredentialsResponse } from "@/pages/api/project/credentials";
import type { Response as ProjectAWSHandshakeGenerateResponse } from "@/pages/api/project/credentials/aws/generate";
import type { Response as ProjectGCPOAuthCallbackResponse } from "@/pages/api/project/credentials/gcp/callback";
import type { Response as ProjectGCPServiceAccountResponse } from "@/pages/api/project/credentials/gcp/credentials";
import type { Response as ProjectGCPOAuthResponse } from "@/pages/api/project/credentials/gcp/oauth";
import type { Response as ProjectDeleteResponse } from "@/pages/api/project/delete";
import type { Response as ProjectGetResponse } from "@/pages/api/project/get";
import type { Response as PlaygroundGetResponse } from "@/pages/api/project/playground/index";
import type { Response as PlaygroundUpdateResponse } from "@/pages/api/project/playground/update";
import type { Response as ProjectUpdateResponse } from "@/pages/api/project/update";
import type { Response as StackErrorResponse } from "@/pages/api/stack/error";
import type { Response as StackGetResponse } from "@/pages/api/stack/get";
import type { Response as StackQueueResponse } from "@/pages/api/stack/queue/[...slug]";
import type { Response as StackUpdateResponse } from "@/pages/api/stack/update";
import type { Response as NotificationUpdateResponse } from "@/pages/api/user/notifications/update";
import type { Notification } from "@/types/notifications";

export type { ResponseData as Stack } from "@/pages/api/stack/get";

interface CreateStackBody {
  [key: string]: any;
  provider: string;
  service: string;
}
export async function createStack(obj: CreateStackBody) {
  const credentials = useAccountStore.getState().currentProject?.credentials
    ?.contents as any;

  if (obj.provider === "aws" && !credentials?.aws)
    return toast.error("AWS credentials are required to create a stack");

  if (obj.provider === "gcp" && !credentials?.gcp)
    return toast.error("GCP credentials are required to create a stack");

  const data = await wretchClient()
    .url(`/api/stack/queue/${obj.provider}/${obj.service}`)
    .json({
      ...obj,
      rocettaConfig: {
        projectId: useAccountStore.getState().currentProject?.id,
      },
      provider: undefined,
      service: undefined,
    })
    .post()
    .badRequest((error) => error.json)
    .json<StackQueueResponse>();

  if (!data.ok) return toast.error(data.error);

  toast.success("Stack queued successfully");

  return data;
}

export async function updateStack(stackId: string, obj: CreateStackBody) {
  const data = await wretchClient()
    .url(`/api/stack/update`)
    .query({ stackId })
    .json({
      ...obj,
      rocettaConfig: {
        projectId: useAccountStore.getState().currentProject?.id,
      },
    })
    .post()
    .badRequest((error) => error.json)
    .json<StackUpdateResponse>();

  if (!data.ok) return toast.error(data.error);

  toast.success("Stack update queued successfully");

  return data;
}

export async function getStack(id: string) {
  return wretchClient()
    .query({ stackId: id })
    .get(`/api/stack/get`)
    .badRequest((error) => error.json)
    .json<StackGetResponse>();
}

export async function getErrors(id: string) {
  return wretchClient()
    .query({ stackId: id })
    .get(`/api/stack/error`)
    .badRequest((error) => error.json)
    .json<StackErrorResponse>();
}

export async function refreshStack(id: string) {
  const data = await wretchClient()
    .url(`/api/stack/refresh`)
    .json({ stackId: id })
    .post()
    .badRequest((error) => error.json)
    .json<StackQueueResponse>();

  if (!data.ok) throw new KnownError(data.error ?? "Something went wrong");

  return data;
}

export async function destroyStack(id: string, forced?: boolean) {
  const data = await wretchClient()
    .url(`/api/stack/delete`)
    .json({ stackId: id })
    .query({
      forced: forced ? "true" : "false",
    })
    .delete()
    .badRequest((error) => error.json)
    .json<StackQueueResponse>();

  if (!data.ok) throw new KnownError(data.error ?? "Something went wrong");

  return data;
}

export async function newProject(name: string) {
  const data = await wretchClient()
    .url(`/api/project/create`)
    .json({ name })
    .post()
    .badRequest((error) => error.json)
    .json<ProjectCreateResponse>();

  return data;
}

export async function getProject(id: string) {
  const data = await wretchClient()
    .url(`/api/project/get`)
    .query({ projectId: id })
    .get()
    .badRequest((error) => error.json)
    .json<ProjectGetResponse>();

  if (!data.ok) {
    return {
      ok: false,
      data: undefined,
    };
  }

  return data;
}

export async function updateUser(body: { name?: string }) {
  const data = await wretchClient()
    .url(`/api/user/update`)
    .json(body)
    .post()
    .badRequest((error) => error.json)
    // TODO: Fix this
    .json<ProjectGetResponse>();

  return data;
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
  }
) {
  const response = await wretchClient()
    .url(`/api/project/update`)
    .json(data)
    .post()
    .badRequest((error) => error.json)
    .json<ProjectUpdateResponse>();

  return response;
}

export async function deleteProject(_: string) {
  const response = await wretchClient()
    .url(`/api/project/delete`)
    .delete()
    .badRequest((error) => error.json)
    .json<ProjectDeleteResponse>();

  return response;
}

export async function updateCredentials(obj: { [key: string]: any }) {
  const data = await wretchClient()
    .url("/api/project/credentials")
    .json(obj)
    .post()
    .badRequest((error) => error.json)
    .json<CredentialsResponse>();

  return data;
}

export async function billingAWSSetup(_: string) {
  const data = await wretchClient()
    .url("/api/project/billing/aws/setup")
    .post()
    .badRequest((error) => error.json)
    .json<AWSSetupResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

export async function editNotification(index: string, noti: Notification) {
  const data = await wretchClient()
    .url("/api/user/notifications/update")
    .query({ id: index })
    .json(noti)
    .post()
    .badRequest((error) => error.json)
    .json<NotificationUpdateResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

export async function clearNotifications() {
  const data = await wretchClient()
    .url("/api/user/notifications/clear")
    .delete()
    .badRequest((error) => error.json)
    .json<NotificationUpdateResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

export async function getAWSCloudformationUrl() {
  const data = await wretchClient()
    .url("/api/project/credentials/aws/generate")
    .post()
    .badRequest((error) => error.json)
    .json<ProjectAWSHandshakeGenerateResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

export async function getGoogleCredentialsOAuthUrl() {
  const data = await wretchClient()
    .url("/api/project/credentials/gcp/oauth")
    .post()
    .badRequest((error) => error.json)
    .json<ProjectGCPOAuthResponse>();

  return data;
}

export async function provideGoogleCredentialsOAuthCode(code: string) {
  const data = await wretchClient()
    .url("/api/project/credentials/gcp/callback")
    .json({ code })
    .post()
    .badRequest((error) => error.json)
    .json<ProjectGCPOAuthCallbackResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

export async function createServiceAccount(
  gcpProject: string,
  createAccount: "on" | "off" = "off"
) {
  const data = await wretchClient()
    .url("/api/project/credentials/gcp/credentials")
    .json({ gcpProject, createAccount })
    .post()
    .badRequest((error) => error.json)
    .json<ProjectGCPServiceAccountResponse>();

  return data;
}

export async function updatePlayground(playgroundData: {
  edges: any[];
  nodes: any[];
}) {
  const data = await wretchClient()
    .url("/api/project/playground/update")
    .json(playgroundData)
    .post()
    .badRequest((error) => error.json)
    .json<PlaygroundUpdateResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

export async function getPlaygroundData() {
  const data = await wretchClient()
    .url("/api/project/playground")
    .get()
    .badRequest((error) => error.json)
    .json<PlaygroundGetResponse>();

  if (!data.ok) throw new KnownError((data as any).error);

  return data;
}

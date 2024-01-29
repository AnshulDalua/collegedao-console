import { z } from "zod";

import { CloudCredentials as CloudCredentialsBackend } from "./infra/src/types/builder";

export const aws = z.object({
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
});

export const gcp = z.object({
  GOOGLE_CREDENTIALS: z.string(),
  GOOGLE_PROJECT: z.string(),
});

export const CloudCredentials = z
  .object({
    aws: aws.optional(),
    gcp: gcp.optional(),
  })
  .optional();

// IF THIS DOESN'T WORK, THE FRONTEND IS NOT UP TO DATE WITH THE BACKEND
const _ = CloudCredentials satisfies typeof CloudCredentialsBackend;

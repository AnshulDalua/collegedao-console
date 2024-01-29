import { useEffect, useState } from "react";

import { wretchClient } from "@/hooks/Wretch";

import type { Response as ServicesStorageReponse } from "@/pages/api/services/aws/credentials";

interface Credentials {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export const useCredentials = (id: string) => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  useEffect(() => {
    if (!id) return;
    wretchClient()
      .url("/api/services/aws/credentials")
      .query({ stackId: id })
      .get()
      .badRequest((error) => error.json)
      .json<ServicesStorageReponse>()
      .then((response) => {
        if (!response.ok) return;

        setCredentials({
          accessKeyId: response.data.credentials.AccessKeyId as string,
          secretAccessKey: response.data.credentials.SecretAccessKey as string,
          sessionToken: response.data.credentials.SessionToken,
          region: response.data.region,
        });
      });
  }, [id]);

  return credentials;
};

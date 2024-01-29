import { toast } from "sonner";
import { match } from "ts-pattern";
import { useCallback, useEffect, useState } from "react";

import { LoadingSmall } from "@/components/Loading";
import Modaler from "@/components/reusables/modaler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { wretchClient } from "@/hooks/Wretch";
import { useModal } from "@/stores/modal";

import type { Response as ServicesInstanceReponse } from "@/pages/api/services/instance";

export default function ConnectModal() {
  const [open, setOpen, data] = useModal("connect", "instance");
  const [email, setEmail] = useState<string | null>(null);

  const connectInstance = useCallback(
    (id: string, gcp_email?: string) => {
      wretchClient()
        .url("/api/services/instance")
        .query({
          instanceId: id,
          gcp_email,
        })
        .get()
        .badRequest((error) => error.json)
        .json<ServicesInstanceReponse>()
        .then((data) => {
          if ("error" in data) {
            toast.error(data.error);
            return setOpen(false);
          }
          window.open(data.data?.url, "_blank");
          setOpen(false);
        });
    },
    [setOpen]
  );

  useEffect(() => {
    if (open && data?.provider === "aws") connectInstance(data.id);
  }, [open, data.id, data.provider]);

  return (
    <Modaler set={setOpen} open={open}>
      {match(data.provider)
        .with("gcp", () => (
          <form
            className="justify-items flex flex-col p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await connectInstance(data.id, email ?? "");
            }}
          >
            <p className="text-center text-lg font-semibold">
              Please enter your GCP email that is connected to this instance to
              route you to the correct GCP project.
            </p>
            <Input
              className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="email"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="mt-2 flex-1"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="mt-2 flex-1"
                variant="default"
                type="submit"
                disabled={!email || email === ""}
              >
                Connect
              </Button>
            </div>
          </form>
        ))
        .with("aws", () => (
          <div className="flex flex-col items-center">
            <LoadingSmall className="mx-auto -ml-1 mr-2 mt-1 h-5 w-5 animate-spin text-black dark:text-white" />
          </div>
        ))
        .otherwise(() => null)}
    </Modaler>
  );
}

import { toast } from "sonner";
import { useEffect, useState } from "react";

import Modaler from "@/components/reusables/modaler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { wretchClient } from "@/hooks/Wretch";
import { useModal } from "@/stores/modal";

import type { ResponseData as ServicesDatabasePasswordTypeNoError } from "@/pages/api/services/database/password";

export default function ConnectModal() {
  const [config, setConfig] = useState<ServicesDatabasePasswordTypeNoError>();
  const [open, setOpen, data] = useModal("connect", "database");

  function copyToClipboard(e: any) {
    e.preventDefault();
    if (!navigator.clipboard) return toast.error("Clipboard not supported");
    if (!config?.url) return toast.error("No url to copy");
    navigator.clipboard.writeText(config?.url);
    toast.success("Database url copied to clipboard");
  }

  useEffect(() => {
    function connectDatabase(id: string) {
      wretchClient()
        .url("/api/services/database/password")
        .query({ databaseId: id })
        .get()
        .json((data) => {
          if (!data.ok) return toast.error(data.error);
          setConfig(data.data);
        });
      wretchClient()
        .url("/api/services/database/info")
        .query({ databaseId: id })
        .get()
        .json((data) => {
          if (!data.ok) return toast.error(data.error);
        });
    }

    if (open) connectDatabase(data.id);
  }, [open, data.id]);

  if (!config) return null;

  return (
    <Modaler set={setOpen} open={open}>
      <form>
        <h2
          className="pb-2 text-lg font-medium leading-6 text-gray-600 dark:text-white"
          id="modal-headline"
        >
          Connect
        </h2>
        <p className="pb-6 text-sm text-gray-500 dark:text-gray-100">
          <b>Type</b>: {config?.login.type} <br />
          <b>Name</b>: {config?.login.name} <br />
          <b>User</b>: {config?.login.user} <br />
          <b>Password</b>: {config?.login.password} <br />
          <b>Endpoint</b>: {config?.login.endpoint} <br />
          <b>Port</b>: {config?.login.port} <br />
        </p>
        <div className="isolate -space-y-px rounded-md shadow-sm">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-primary"
          >
            Connection URL (Click to copy)
          </label>

          <div className="grid grid-cols-4 items-center gap-2 pt-2">
            <Input
              className="col-span-3"
              value={config?.url}
              onClick={(e) => copyToClipboard(e)}
              readOnly
            />
            <Button onClick={(e) => copyToClipboard(e)} className="min-h-full">
              Copy
            </Button>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-1 sm:gap-3">
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rho-secondary focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </form>
    </Modaler>
  );
}

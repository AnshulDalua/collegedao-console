import debounce from "lodash/debounce";
import get from "lodash/get";
import { match } from "ts-pattern";
import { useCallback, useEffect, useRef, useState } from "react";

import Modaler from "@/components/reusables/modaler";
import { NameInput } from "@/components/Services/CommonInputs";
import CostSnippet from "@/components/Services/Cost";
import { GenericSelect } from "@/components/Services/Generics";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useModal } from "@/stores/modal";
import { getStack, updateStack } from "@/utils/api";
import { formDataToObject, handleFormData } from "@/utils/FormData";
import { aws_storage, gcp_storage } from "@/utils/infracost";

import type { Stack } from "@/utils/api";
import type { Cost } from "@/utils/infracost";

export default function DatabaseUpdate() {
  const [open, setOpen, stackId] = useModal("update", "storage");
  const [pastStackData, setPastStackData] = useState<Stack | null>(null);
  const [cost, setCost] = useState<Cost | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | undefined>(undefined);
  const formRef = useRef(null);

  const debounceUpdate = useCallback(
    () =>
      debounce(async () => {
        setLoading(true);
        if (!provider) return;
        const data = formDataToObject(formRef.current) as any;
        const region =
          get(pastStackData?.input, "enviromentConfig.region") ?? "";
        const acl = get(pastStackData?.input, "acl") ?? "";
        setCost(
          await match(data.provider)
            .with("aws", () => aws_storage(region, acl, "false"))
            .with("gcp", () => gcp_storage(region, acl, "false"))
            .otherwise(() => null)
        );
        setLoading(false);
      }, 200),

    [provider]
  );

  useEffect(() => {
    if (stackId) {
      getStack(stackId.id).then((response) => {
        if (!response.ok) return;
        setPastStackData(response.data);
        setProvider(response.data?.type.split("::")[0] ?? undefined);
        debounceUpdate()();
      });
    }
  }, [debounceUpdate, stackId]);

  if (!pastStackData) return null;

  return (
    <Modaler open={open} set={setOpen}>
      <DialogHeader>
        <DialogTitle>Update Storage</DialogTitle>
        <DialogDescription>
          Storages are unstructured sets of data held in a computer.
        </DialogDescription>
        <CostSnippet cost={cost} loading={loading} />
      </DialogHeader>

      <form
        onSubmit={async (event) => {
          const data = handleFormData(event) as any;
          data.service = "storage";
          await updateStack(pastStackData.id, data);
          setOpen(false);
        }}
        onChange={debounceUpdate()}
        onLoad={debounceUpdate()}
        ref={formRef}
      >
        <Tabs value={provider}>
          {/** @AMAZON_WEB_SERVICES **/}
          <TabsContent value="aws" className="grid-row-auto mt-0 grid gap-5">
            <NameInput defaultValue={pastStackData.name} className="pb-0" />
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Read Access</Label>
              <GenericSelect
                name="size::acl"
                data={[
                  {
                    value: "private",
                    name: "Private",
                    description: "Only you can access this storage",
                  },
                  {
                    value: "public-read",
                    name: "Public",
                    description: "Anyone can access (read) this storage",
                  },
                ]}
                defaultValue={get(pastStackData.input, "acl")}
              />
            </div>
          </TabsContent>

          {/** @GOOGLE_CLOUD **/}
          <TabsContent value="gcp" className="grid-row-auto mt-0 grid gap-5">
            <NameInput defaultValue={pastStackData.name} className="pb-0" />
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Read Access</Label>
              <GenericSelect
                name="size::acl"
                data={[
                  {
                    value: "private",
                    name: "Private",
                    description: "Only you can access this storage",
                  },
                  {
                    value: "publicread",
                    name: "Public",
                    description: "Anyone can access (read) this storage",
                  },
                ]}
                defaultValue={get(pastStackData.input, "acl")}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Cancel
          </Button>
          <Button className="w-full" type="submit">
            Upgrade
          </Button>
        </div>
      </form>
    </Modaler>
  );
}

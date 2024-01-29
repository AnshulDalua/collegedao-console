import debounce from "lodash/debounce";
import { match } from "ts-pattern";
import { useCallback, useRef, useState } from "react";

import { LoadingSmall } from "@/components/Loading";
import Modaler from "@/components/reusables/modaler";
import {
  AWSRegionComboxBox,
  GCPRegionComboxBox,
  NameInput,
  ProviderTabList,
} from "@/components/Services/CommonInputs";
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
import { createStack } from "@/utils/api";
import { formDataToObject, handleFormData } from "@/utils/FormData";
import { aws_storage, gcp_storage } from "@/utils/infracost";

import type { Cost } from "@/utils/infracost";

export default function StorageCreate() {
  const [open, setOpen] = useModal("create", "storage");
  const [cost, setCost] = useState<Cost | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const debounceUpdate = useCallback(
    () =>
      debounce(async () => {
        setCost(null);
        const data = formDataToObject(formRef.current) as any;
        setCost(
          await match(data.provider)
            .with("aws", () => aws_storage(data.region, data.acl, "false"))
            .with("gcp", () => gcp_storage(data.region, data.acl, "false"))
            .otherwise(() => null)
        );
      }, 200),
    []
  );

  return (
    <Modaler open={open} set={setOpen}>
      <DialogHeader>
        <DialogTitle>Storage</DialogTitle>
        <DialogDescription>
          Create a new storage to run your application on.
        </DialogDescription>
        <CostSnippet cost={cost} loading={!cost} />
      </DialogHeader>

      <form
        onSubmit={async (event) => {
          setLoading(true);
          const data = handleFormData(event) as any;
          data.service = "storage";
          await createStack(data);
          setLoading(false);
          setOpen(false);
        }}
        onChange={debounceUpdate()}
        onLoad={debounceUpdate()}
        ref={formRef}
      >
        <Tabs defaultValue="aws" onValueChange={debounceUpdate()}>
          <ProviderTabList />
          <NameInput />
          {/** @AMAZON_WEB_SERVICES **/}
          <TabsContent value="aws" className="grid-row-auto mt-0 grid gap-5">
            {/** Storage Size */}
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
              />
            </div>

            {/** Storage Region */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Region</Label>
              <AWSRegionComboxBox />
            </div>
          </TabsContent>

          {/** @GOOGLE_CLOUD **/}
          <TabsContent value="gcp" className="grid-row-auto mt-0 grid gap-5">
            {/** Storage Access */}
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
              />
            </div>
            {/** Storage Region */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Region</Label>
              <GCPRegionComboxBox />
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
            {loading && (
              <LoadingSmall className="-ml-1 mr-2 h-3 w-3 animate-spin text-white dark:text-black" />
            )}
            Deploy
          </Button>
        </div>
      </form>
    </Modaler>
  );
}

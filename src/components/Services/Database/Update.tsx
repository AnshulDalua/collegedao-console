import debounce from "lodash/debounce";
import get from "lodash/get";
import { match } from "ts-pattern";
import { useCallback, useEffect, useRef, useState } from "react";

import Modaler from "@/components/reusables/modaler";
import { NameInput } from "@/components/Services/CommonInputs";
import CostSnippet from "@/components/Services/Cost";
import { MACHINE_SIZES } from "@/components/Services/Database/Create";
import { GenericCheckbox, GenericSelect } from "@/components/Services/Generics";
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
import { aws_database, gcp_database } from "@/utils/infracost";

import type { Stack } from "@/utils/api";
import type { Cost } from "@/utils/infracost";

export default function DatabaseUpdate() {
  const [open, setOpen, stackId] = useModal("update", "database");
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
        setCost(
          await match(provider)
            .with("aws", () => {
              const region =
                get(pastStackData?.input, "enviromentConfig.region") ?? "";
              const type = get(pastStackData?.input, "engine") ?? "";
              return aws_database(region, data.size, type, data.multiAz);
            })
            .with("gcp", () => gcp_database(data.region, data.size, data.type))
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
        <DialogTitle>Update Database</DialogTitle>
        <DialogDescription>
          Databases are structured sets of data held in a computer, especially
          one that is accessible in various ways.
        </DialogDescription>
        <CostSnippet cost={cost} loading={loading} />
      </DialogHeader>

      <form
        onSubmit={async (event) => {
          const data = handleFormData(event) as any;
          data.service = "database";
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
            {/** Database Size */}
            <NameInput defaultValue={pastStackData.name} className="pb-0" />
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Size</Label>
              <GenericSelect
                name="size::instanceType"
                data={MACHINE_SIZES.aws}
                defaultValue={get(pastStackData.input, "instanceType")}
              />
            </div>

            {/** Database Multi-AZ*/}
            <GenericCheckbox
              name="multiAz::options.multiAz"
              label="Multi Zoned"
              description="Ensures that you do not lose any data and zero manual intervention."
              defaultValue={get(pastStackData.input, "options.multiAz")}
            />
          </TabsContent>

          {/** @GOOGLE_CLOUD **/}
          <TabsContent value="gcp" className="grid-row-auto mt-0 grid gap-5">
            <NameInput defaultValue={pastStackData.name} className="pb-0" />
            {/** Database Size */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Size</Label>
              <GenericSelect
                name="size::machineType"
                data={MACHINE_SIZES.gcp}
                defaultValue={get(pastStackData.input, "machineType")}
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

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
import { GenericInput, GenericSelect } from "@/components/Services/Generics";
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
import { aws_instance, gcp_instance } from "@/utils/infracost";

import type { Cost } from "@/utils/infracost";

export default function InstanceCreate() {
  const [open, setOpen] = useModal("create", "instance");
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
            .with("aws", () =>
              aws_instance(data.region, data.size, data.storage)
            )
            .with("gcp", () =>
              gcp_instance(data.region, data.size, data.type, data.storage)
            )
            .otherwise(() => null)
        );
      }, 200),
    []
  );

  return (
    <Modaler open={open} set={setOpen}>
      <DialogHeader>
        <DialogTitle>Instance</DialogTitle>
        <DialogDescription>
          Create a new instance to run your application on.
        </DialogDescription>
        <CostSnippet cost={cost} loading={!cost} />
      </DialogHeader>

      <form
        onSubmit={async (event) => {
          setLoading(true);
          const data = handleFormData(event) as any;
          data.service = "instance";
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
          {/** @AMAZON_WEB_SERVICES **/}
          <NameInput />
          <TabsContent value="aws" className="grid-row-auto mt-0 grid gap-5">
            {/** Database Type */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Type</Label>
              <GenericSelect
                name="type::imageType"
                data={[
                  {
                    value: "Canonical, Ubuntu, 22.04 LTS, amd64*",
                    name: "Ubuntu",
                    description: "Ubuntu 22.04 LTS",
                  },
                  {
                    value: "Amazon Linux 2 Kernel 5.10*",
                    name: "Amazon Linux 2",
                    description: "Amazon Linux 2 Kernel 5.10",
                  },
                  {
                    value: "Debian 11*",
                    name: "Debian",
                    description: "Debian 11",
                  },
                ]}
              />
            </div>
            {/** Database Size */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Size</Label>
              <GenericSelect
                name="size::instanceType"
                data={MACHINE_SIZES.aws}
              />
            </div>

            {/** Database Region */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Region</Label>
              <AWSRegionComboxBox />
            </div>
          </TabsContent>

          {/** @GOOGLE_CLOUD **/}
          <TabsContent value="gcp" className="grid-row-auto mt-0 grid gap-5">
            {/** Database Type */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Type</Label>
              <GenericSelect
                name="type::image"
                data={[
                  {
                    value:
                      "projects/ubuntu-os-cloud/global/images/ubuntu-2004-focal-v20230812",
                    name: "Ubuntu",
                    description: "Ubuntu 22.04 LTS",
                  },
                  {
                    value:
                      "projects/debian-cloud/global/images/debian-11-bullseye-v20230809",
                    name: "Debian",
                    description: "Debian 11",
                  },
                  {
                    value:
                      "projects/centos-cloud/global/images/centos-stream-8-v20230809",
                    name: "CentOS",
                    description: "CentOS 8",
                  },
                ]}
              />
            </div>
            {/** Database Size */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Size</Label>
              <GenericSelect
                name="size::machineType"
                data={MACHINE_SIZES.gcp}
              />
            </div>
            {/** Database Region */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Region</Label>
              <GCPRegionComboxBox />
            </div>
          </TabsContent>

          <div className="flex flex-col gap-2 pt-[1.25rem]">
            <Label className="ml-0.5 ">Storage (GB)</Label>
            <GenericInput
              name="storage::storage"
              label="Storage"
              type="number"
              placeholder={"10"}
              required
              onFocus={(e) => {
                if (e.target.value == "10") e.target.value = "";
              }}
              defaultValue={10}
            />
          </div>
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

export const MACHINE_SIZES = {
  aws: [
    {
      name: "Extra Small",
      value: "t2.micro",
      description: "1 vCPU, 1 GB RAM",
    },
    {
      name: "Small",
      value: "t2.small",
      description: "1 vCPU, 2 GB RAM",
    },
    {
      name: "Medium",
      value: "t2.medium",
      description: "2 vCPU, 4 GB RAM",
    },
    {
      name: "Large",
      value: "t2.large",
      description: "2 vCPU, 8 GB RAM",
    },
    {
      name: "Extra Large",
      value: "t2.xlarge",
      description: "4 vCPU, 16 GB RAM",
    },
    {
      name: "Extra 2x Large",
      value: "t2.2xlarge",
      description: "8 vCPU, 32 GB RAM",
    },
  ],
  gcp: [
    {
      name: "Extra Small",
      value: "e2-small",
      description: "0.5 vCPU, 2 GB RAM",
    },
    {
      name: "Small",
      value: "e2-standard-4",
      description: "4 vCPU, 16 GB RAM",
    },
    {
      name: "Medium",
      value: "e2-standard-8",
      description: "8 vCPU, 32 GB RAM",
    },
    {
      name: "Large",
      value: "e2-standard-16",
      description: "16 vCPU, 64 GB RAM",
    },
    {
      name: "Extra Large",
      value: "e2-standard-32",
      description: "32 vCPU, 128 GB RAM",
    },
  ],
};

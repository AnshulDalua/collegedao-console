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
import { createStack } from "@/utils/api";
import { formDataToObject, handleFormData } from "@/utils/FormData";
import { aws_database, gcp_database } from "@/utils/infracost";

import type { Cost } from "@/utils/infracost";

export default function DatabaseCreate() {
  const [open, setOpen] = useModal("create", "database");
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
              aws_database(data.region, data.size, data.type, data.multiAz)
            )
            .with("gcp", () => gcp_database(data.region, data.size, data.type))
            .otherwise(() => null)
        );
      }, 200),
    []
  );

  return (
    <Modaler open={open} set={setOpen}>
      <DialogHeader>
        <DialogTitle>Database</DialogTitle>
        <DialogDescription>
          Databases are structured sets of data held in a computer, especially
          one that is accessible in various ways.
        </DialogDescription>
        <CostSnippet cost={cost} loading={!cost} />
      </DialogHeader>

      <form
        onSubmit={async (event) => {
          setLoading(true);
          const data = handleFormData(event) as any;
          data.service = "database";
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
            {/** Database Type */}
            <div className="flex flex-col gap-2">
              <Label className="ml-0.5">Type</Label>
              <GenericSelect
                name="type::engine"
                data={[
                  { value: "mysql", name: "MySQL", description: "MySQL 8.0" },
                  {
                    value: "postgres",
                    name: "PostgreSQL",
                    description: "Postgres 15",
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

            {/** Database Multi-AZ*/}
            <GenericCheckbox
              name="multiAz::options.multiAz"
              label="Multi Zoned"
              description="Keeps your database in multiple zones to prevent downtime."
            />
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
                    value: "MYSQL_8_0",
                    name: "MySQL",
                    description: "MySQL 8.0",
                  },
                  {
                    value: "POSTGRES_15",
                    name: "PostgreSQL",
                    description: "Postgres 15",
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
            )}{" "}
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
      name: "Extra 2x Small",
      value: "db.t4g.micro",
      description: "2 vCPU, 1 GB RAM (T4g)",
    },
    {
      name: "Extra Small",
      value: "db.t4g.small",
      description: "2 vCPU, 2 GB RAM (T4g)",
    },
    {
      name: "Small",
      value: "db.t4g.xlarge",
      description: "4 vCPU, 16 GB RAM (T4g)",
    },
    {
      name: "Medium",
      value: "db.r6g.2xlarge",
      description: "8 vCPU, 32 GB RAM (T4g)",
    },
    {
      name: "Large",
      value: "db.m6g.4xlarge",
      description: "16 vCPU, 64 GB RAM",
    },
    {
      name: "Extra Large",
      value: "db.m6g.8xlarge",
      description: "32 vCPU, 128 GB RAM",
    },
    {
      name: "Extra 2x Large",
      value: "db.m6g.16xlarge",
      description: "64 vCPU, 256 GB RAM",
    },
  ],
  gcp: [
    {
      name: "Extra 2x Small",
      value: "db-f1-micro",
      description: "Shared vCPU, 0.6 GB RAM",
    },
    {
      name: "Extra Small",
      value: "db-g1-small",
      description: "Shared vCPU, 1.7 GB RAM",
    },
    {
      name: "Small",
      value: "db-custom-1-3840",
      description: "1 vCPU, 3.75 GB RAM",
    },
    {
      name: "Medium",
      value: "db-custom-4-15360",
      description: "4 vCPU, 15 GB RAM",
    },
    {
      name: "Large",
      value: "db-custom-8-30720",
      description: "8 vCPU, 30 GB RAM",
    },
    {
      name: "Large",
      value: "db-custom-16-61440",
      description: "16 vCPU, 60 GB RAM",
    },
    {
      name: "Extra 2x Large",
      value: "db-custom-32-122880",
      description: "32 vCPU, 120 GB RAM",
    },
  ],
};

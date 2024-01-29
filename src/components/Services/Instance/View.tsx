import Fuse from "fuse.js";
import get from "lodash/get";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { LoadingFill } from "@/components/Loading";
import { GenericFilterButton } from "@/components/Services/Generics";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { useWRC } from "@/hooks/useWRC";
import { useModal } from "@/stores/modal";

import InstanceStack from "./Stack";

import type { ResponseData as StackType } from "@/pages/api/stack/list";

const AlertDestructive = dynamic(() => import("@/components/Core/Error"));

export default function InstanceView() {
  const [search, setSearch] = useState("");
  const [_, setOpenCreate] = useModal("create", "instance");
  const [include, setInclude] = useState<string[]>([]);
  const {
    data: instances,
    error,
    loading,
  } = useWRC<StackType>(
    "/api/stack/list",
    (chain) =>
      chain.query({ service: "instance", from: "0", to: "100", include }),
    { key: "instance" + include.join(",") }
  );

  const fuse = useMemo(
    () =>
      new Fuse(instances ?? [], {
        keys: ["name", "status"],
        useExtendedSearch: true,
      }),
    [instances]
  );

  const filteredInstance = useMemo(() => {
    if (!instances) return [];
    if (!search) return instances;
    else {
      const returned = fuse.search(search).map(({ item }) => item);
      if (returned.length === 0) return null;
      return returned;
    }
  }, [instances, fuse, search]);

  return (
    <div className="justify-left mx-auto grid max-w-5xl items-center">
      <div className="my-2 flex flex-col">
        <h3 className="text-2xl font-bold">Instances</h3>
        <p className="text-lg text-gray-500">
          Fastest way to deploy instances on AWS and GCP.
        </p>
      </div>
      <div className="items-left flex w-full max-w-5xl flex-col justify-between sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center">
          <Search
            className="my-2 w-[400px] rounded-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
          <GenericFilterButton
            name="instance"
            onClick={() => {
              setInclude((i) => {
                if (i.includes("deleted"))
                  return i.filter((x) => x !== "deleted");
                else return [...i, "deleted"];
              });
            }}
          />
        </div>

        <Button onClick={() => setOpenCreate(true)}>Deploy new instance</Button>
      </div>

      {error && (
        <AlertDestructive
          title="Something went wrong"
          description={error.message}
        />
      )}
      {loading && <LoadingFill />}
      {filteredInstance &&
        filteredInstance.map((instance) => (
          <div key={instance.id} className="fadeIn my-2 w-full">
            <InstanceStack
              id={instance.id}
              name={instance.name}
              type={
                get(instance, "input.imageType") ??
                get(instance, "input.image") ??
                ""
              }
              size={
                get(instance, "input.instanceType") ??
                get(instance, "input.machineType") ??
                ""
              }
              provider={instance?.type.split("::")[0]}
              region={get(instance, "input.enviromentConfig.region")}
              status={instance.status}
              createdAt={instance.createdAt as unknown as string}
              updatedAt={instance.updatedAt as unknown as string}
            />
          </div>
        ))}
      {!loading && filteredInstance && filteredInstance.length === 0 && (
        <div className="flex h-full max-w-5xl items-center justify-center rounded-md border border-dashed py-[15vh] text-sm">
          <p className=" flex flex-col items-center text-gray-500 dark:text-gray-200">
            No instances found
            <a
              className="cursor-pointer text-gray-400 dark:text-gray-600"
              onClick={() => setOpenCreate(true)}
            >
              Try to deploy a new instance
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

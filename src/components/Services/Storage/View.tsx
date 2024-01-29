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
  const [_, setOpenCreate] = useModal("create", "storage");
  const [include, setInclude] = useState<string[]>([]);
  const {
    data: storages,
    error,
    loading,
  } = useWRC<StackType>(
    "/api/stack/list",
    (chain) =>
      chain.query({
        service: "storage",
        from: "0",
        to: "100",
        include,
      }),
    { key: "storage" + include.join(",") }
  );

  const fuse = useMemo(
    () =>
      new Fuse(storages ?? [], {
        keys: ["name", "status"],
        useExtendedSearch: true,
      }),
    [storages]
  );

  const filteredStorages = useMemo(() => {
    if (!storages) return [];
    if (!search) return storages;
    else {
      const returned = fuse.search(search).map(({ item }) => item);
      if (returned.length === 0) return null;
      return returned;
    }
  }, [storages, fuse, search]);

  return (
    <div className="justify-left mx-auto grid max-w-5xl items-center">
      <div className="my-2 flex flex-col">
        <h3 className="text-2xl font-bold">Storage</h3>
        <p className="text-lg text-gray-500">
          Fastest way to provision storage on AWS and GCP.
        </p>
      </div>
      <div className="items-left flex w-full max-w-5xl flex-col justify-between sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center">
          <Search
            className="my-2 w-[400px] rounded-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
          <GenericFilterButton
            name="storage"
            onClick={() => {
              setInclude((i) => {
                if (i.includes("deleted"))
                  return i.filter((x) => x !== "deleted");
                else return [...i, "deleted"];
              });
            }}
          />
        </div>
        <Button onClick={() => setOpenCreate(true)}>Deploy new storage</Button>
      </div>

      {error && (
        <AlertDestructive
          title="Something went wrong"
          description={error.message}
        />
      )}
      {loading && <LoadingFill />}
      {filteredStorages &&
        filteredStorages.map((storage) => (
          <div key={storage.id} className="fadeIn my-2 w-full">
            <InstanceStack
              id={storage.id}
              name={storage.name}
              provider={storage?.type.split("::")[0]}
              region={get(storage, "input.enviromentConfig.region")}
              status={storage.status}
              createdAt={storage.createdAt as unknown as string}
              updatedAt={storage.updatedAt as unknown as string}
            />
          </div>
        ))}
      {!loading && filteredStorages && filteredStorages.length === 0 && (
        <div className="flex h-full max-w-5xl items-center justify-center rounded-md border border-dashed py-[15vh] text-sm">
          <p className=" flex flex-col items-center text-gray-500 dark:text-gray-200">
            No storages found
            <a
              className="cursor-pointer text-gray-400 dark:text-gray-600"
              onClick={() => setOpenCreate(true)}
            >
              Try to deploy a new storage
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

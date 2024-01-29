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

import DatabaseStack from "./Stack";

import type { ResponseData as StackType } from "@/pages/api/stack/list";

const AlertDestructive = dynamic(() => import("@/components/Core/Error"));

export default function DatabaseView() {
  const [search, setSearch] = useState("");
  const [_, setOpenCreate] = useModal("create", "database");
  const [include, setInclude] = useState<string[]>([]);
  const {
    data: databases,
    error,
    loading,
  } = useWRC<StackType>(
    "/api/stack/list",
    (chain) =>
      chain.query({ service: "database", from: "0", to: "100", include }),
    { key: "database" + include.join(",") }
  );

  const fuse = useMemo(
    () =>
      new Fuse(databases ?? [], {
        keys: ["name", "status"],
        useExtendedSearch: true,
      }),
    [databases]
  );

  const filteredDatabase = useMemo(() => {
    if (!databases) return [];
    if (!search) return databases;
    else {
      const returned = fuse.search(search).map(({ item }) => item);
      if (returned.length === 0) return null;
      return returned;
    }
  }, [databases, fuse, search]);

  return (
    <div className="justify-left mx-auto grid max-w-5xl items-center">
      <div className="my-2 flex flex-col">
        <h3 className="text-2xl font-bold">Databases</h3>
        <p className="text-lg text-gray-500">
          Fastest way to deploy databases on AWS and GCP.
        </p>
      </div>
      <div className="items-left flex w-full max-w-5xl flex-col justify-between sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center">
          <Search
            className="my-2 w-[400px] rounded-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
          <GenericFilterButton
            name="database"
            onClick={() => {
              setInclude((i) => {
                if (i.includes("deleted"))
                  return i.filter((x) => x !== "deleted");
                else return [...i, "deleted"];
              });
            }}
          />
        </div>

        <Button onClick={() => setOpenCreate(true)}>Deploy new database</Button>
      </div>

      {error && (
        <AlertDestructive
          title="Something went wrong"
          description={error.message}
        />
      )}
      {loading && <LoadingFill />}
      {filteredDatabase &&
        filteredDatabase.map((database) => (
          <div key={database.id} className="fadeIn my-2 w-full">
            <DatabaseStack
              id={database.id}
              name={database.name}
              type={
                get(database, "input.engine") ??
                get(database, "input.image") ??
                ""
              }
              provider={database?.type.split("::")[0] ?? "aws"}
              region={get(database, "input.enviromentConfig.region")}
              size={
                get(database, "input.instanceType") ??
                get(database, "input.machineType") ??
                ""
              }
              status={database.status}
              createdAt={database.createdAt as unknown as string}
              updatedAt={database.updatedAt as unknown as string}
            />
          </div>
        ))}
      {!loading && filteredDatabase && filteredDatabase.length === 0 && (
        <div className="flex h-full max-w-5xl items-center justify-center rounded-md border border-dashed py-[15vh] text-sm">
          <p className=" flex flex-col items-center text-gray-500 dark:text-gray-200">
            No databases found
            <a
              className="cursor-pointer text-gray-400 dark:text-gray-600"
              onClick={() => setOpenCreate(true)}
            >
              Try to deploy a new database
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

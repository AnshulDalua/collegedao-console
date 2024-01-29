import dynamic from "next/dynamic";

import "reactflow/dist/base.css";

import React, { useEffect, useState } from "react";

import { useWRC } from "@/hooks/useWRC";
import { useAccountStore } from "@/stores/account";
import { usePlaygroundStore } from "@/stores/playground";

import Menu from "./Menu/Menu";
import Playground from "./Playground";

import type { ResponseData as StackType } from "@/pages/api/stack/list";

const AlertDestructive = dynamic(() => import("@/components/Core/Error"));

export default function PlaygroundView() {
  const setStackData = usePlaygroundStore((state) => state.setStackData);
  const reactFlow = usePlaygroundStore((state) => state.reactFlowInstance);
  const projectId = useAccountStore((state) => state.currentProject?.id);
  const [loadingProject, setLoadingProject] = useState(true);

  const {
    data: stackData,
    error,
    loading,
  } = useWRC<StackType>(
    "/api/stack/list",
    (chain) => chain.query({ from: "0", to: "100" }),
    { key: "all" }
  );

  useEffect(() => {
    if (stackData) {
      setLoadingProject(true);
      setStackData(stackData);
      setLoadingProject(false);
    }
  }, [setStackData, stackData]);

  useEffect(() => {
    reactFlow?.fitView({
      maxZoom: 1,
    });
  }, [reactFlow, projectId]);

  return (
    <div className="fixed h-full w-full lg:-ml-6 lg:w-[calc(100%-248px)]">
      {error && (
        <AlertDestructive
          title="Something went wrong"
          description={error.message}
        />
      )}

      {stackData && !loading && !loadingProject && (
        <div className="flex h-full w-full flex-col lg:flex-row">
          <div className="h-full w-full">
            <Playground />
          </div>
          <aside className="gap-[8px]border-l flex h-[325px] w-full flex-col  border-light-stroke bg-card p-3 text-sm font-normal dark:border-dark-stroke lg:z-[51] lg:h-full lg:w-[324px] lg:min-w-fit  lg:flex-row ">
            <Menu />
          </aside>
        </div>
      )}
    </div>
  );
}

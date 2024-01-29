import dynamic from "next/dynamic";
import Head from "next/head";

import Layout from "@/components/Core/Sidebar/Layout";
import { useModal } from "@/stores/modal";

import type { ReactElement } from "react";

const InstanceCreate = dynamic(
  () => import("@/components/Services/Instance/Create")
);
const ConnectModal = dynamic(
  () => import("@/components/Services/Instance/Connect")
);
const InstanceView = dynamic(
  () => import("@/components/Services/Instance/View")
);
const InstanceUpdate = dynamic(
  () => import("@/components/Services/Instance/Update")
);

export default function Instance() {
  const [openCreate] = useModal("create", "instance");
  const [openConnect] = useModal("connect", "instance");
  const [openUpdate] = useModal("update", "instance");

  return (
    <>
      <Head>
        <title>Instance - Rocetta</title>
      </Head>
      {openConnect && <ConnectModal />}
      {openCreate && <InstanceCreate />}
      {openUpdate && <InstanceUpdate />}
      <InstanceView />
    </>
  );
}

/** @LAYOUT */
Instance.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

import dynamic from "next/dynamic";
import Head from "next/head";

import Layout from "@/components/Core/Sidebar/Layout";
import { useModal } from "@/stores/modal";

import type { ReactElement } from "react";

const StorageCreate = dynamic(
  () => import("@/components/Services/Storage/Create")
);
const StorageView = dynamic(() => import("@/components/Services/Storage/View"));
const StorageUpdate = dynamic(
  () => import("@/components/Services/Storage/Update")
);
const StorageConnect = dynamic(
  () => import("@/components/Services/Storage/Connect")
);

export default function Storage() {
  const [openCreate] = useModal("create", "storage");
  const [openUpdate] = useModal("update", "storage");
  const [openConnect] = useModal("connect", "storage");

  return (
    <>
      <Head>
        <title>Storage - Rocetta</title>
      </Head>
      {openCreate && <StorageCreate />}
      {openUpdate && <StorageUpdate />}
      {openConnect && <StorageConnect />}
      <StorageView />
    </>
  );
}

/** @LAYOUT */
Storage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

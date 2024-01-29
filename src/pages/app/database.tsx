import dynamic from "next/dynamic";
import Head from "next/head";

import Layout from "@/components/Core/Sidebar/Layout";
import { useModal } from "@/stores/modal";

import type { ReactElement } from "react";

const DatabaseCreate = dynamic(
  () => import("@/components/Services/Database/Create")
);
const ConnectModal = dynamic(
  () => import("@/components/Services/Database/Connect")
);
const DatabaseView = dynamic(
  () => import("@/components/Services/Database/View")
);
const DatabaseUpdate = dynamic(
  () => import("@/components/Services/Database/Update")
);

export default function Database() {
  const [openCreate] = useModal("create", "database");
  const [openConnect] = useModal("connect", "database");
  const [openUpdate] = useModal("update", "database");

  return (
    <>
      <Head>
        <title>Database - Rocetta</title>
      </Head>
      {openConnect && <ConnectModal />}
      {openCreate && <DatabaseCreate />}
      {openUpdate && <DatabaseUpdate />}

      <DatabaseView />
    </>
  );
}

/** @LAYOUT */
Database.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

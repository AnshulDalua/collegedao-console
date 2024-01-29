import dynamic from "next/dynamic";
import Head from "next/head";

import Layout from "@/components/Core/Sidebar/Layout";

import type { ReactElement } from "react";

const PlaygroundView = dynamic(
  () => import("@/components/Core/Playground/View")
);

export default function Playground() {
  return (
    <>
      <Head>
        <title>Playground - Rocetta</title>
      </Head>
      <PlaygroundView />
    </>
  );
}

/** @LAYOUT */
Playground.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

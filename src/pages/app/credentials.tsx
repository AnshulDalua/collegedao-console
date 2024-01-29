import { ReactElement } from "react";
import Head from "next/head";

import { AWSCredentialsForm } from "@/components/Core/Credentials/AWS";
import { GCPCredentialsForm } from "@/components/Core/Credentials/GCP";
import Layout from "@/components/Core/Sidebar/Layout";

export default function Credentials() {
  return (
    <>
      <Head>
        <title>Credentials - Rocetta</title>
      </Head>
      <div className="justify-left mx-auto grid max-w-5xl items-center">
        <div className="my-2 flex flex-col">
          <h3 className="text-2xl font-bold">Credentials</h3>
          <p className="text-lg text-gray-500">
            Enter your credentials to deploy and manage your services.
          </p>
        </div>
        <div className="mt-4 grid gap-8 md:grid-cols-2">
          <AWSCredentialsForm />
          <GCPCredentialsForm />
        </div>
      </div>
    </>
  );
}

Credentials.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

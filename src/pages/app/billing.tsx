import Billing from "@/components/Core/Billing/Index";
import Layout from "@/components/Core/Sidebar/Layout";

import type { ReactElement } from "react";

export default function BillingPage() {
  return <Billing />;
}

/** @LAYOUT */
BillingPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

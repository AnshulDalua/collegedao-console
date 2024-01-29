import sum from "lodash/sum";
import { match } from "ts-pattern";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

import { LoadingFill } from "@/components/Loading";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWRC } from "@/hooks/useWRC";

import { DollarSign } from "./Icons";
import { getDifference, OrganizeAWSBilling } from "./Util";

import type { ResponseData as BillingType } from "@/pages/api/project/billing/aws";

const AlertDestructive = dynamic(() => import("@/components/Core/Error"));
const ThisMonthBar = dynamic(() => import("./Bar").then((i) => i.ThisMonthBar));
const LastTwelveMonths = dynamic(() =>
  import("./Bar").then((i) => i.LastTwelveMonthsBar)
);

/** @JSX */
export default function Billing() {
  const [noProjectFilter, setNoProjectFilter] = useState(false);
  const {
    data: AWSBilling,
    error: AWSError,
    loading: AWSLoading,
  } = useWRC<BillingType>(
    "/api/project/billing/aws",
    (chain) =>
      chain.query({
        noProjectFilter: noProjectFilter,
      }),
    {
      key: "aws_billing" + noProjectFilter,
      swr: {
        refreshInterval: 1000 * 60 * 60 * 24,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      },
    }
  );

  const AWSBillingProcessed = useMemo(
    () => (AWSBilling ? OrganizeAWSBilling(AWSBilling) : null),
    [AWSBilling]
  );

  return (
    <>
      <Head>
        <title>Billing & Usage - Rocetta</title>
      </Head>
      {!AWSLoading && AWSError && (
        <AlertDestructive
          className="mx-auto max-w-xl"
          title="Something went wrong"
          description={match(JSON.parse(AWSError.message).error)
            .with(
              "This project does not exist or you do not have access to it.",
              () =>
                "This project does not exist or you do not have access to it."
            )
            .with(
              "Missing credentials",
              () =>
                "Looks like you haven't connected your AWS account yet. Please add your AWS account to Rocetta to view your billing information. Click the 'Credentials' tab in the sidebar to get started."
            )
            .with(
              "Invalid credentials",
              () =>
                "Looks like your AWS credentials are invalid. Please readd your AWS account to Rocetta to view your billing information. Click the 'Credentials' tab in the sidebar to get started."
            )
            .with(
              "User's Cost Explorer is not enabled",
              () =>
                "Looks like your AWS Cost Explorer is not enabled. Please enable it by view your billing information on AWS. Visit your AWS Console and search `Cost Explorer` and wait a few hours for AWS to enable it. The click the 'Credentials' tab in the sidebar and click `Run AWS Setup`. Wait 24 hours to see your billing information."
            )
            .otherwise(
              () =>
                "Something went wrong while fetching your billing information."
            )}
        />
      )}
      {AWSLoading && <LoadingFill />}
      {AWSBilling && AWSBillingProcessed && (
        <>
          <div className="my-2 flex flex-col">
            <h3 className="text-2xl font-bold">Billing & Usage</h3>
            <p className="flex flex-col text-lg text-muted-foreground  ">
              View your billing and usage across all your projects and
              providers.
              <span className="text-xs text-muted-foreground">
                (AWS only for now)
              </span>
            </p>
          </div>
          <div className="mb-4 flex flex-row items-center justify-between">
            <div></div>
            <div className="my-1 flex items-center space-x-2">
              <Checkbox
                className="mr-1"
                checked={noProjectFilter}
                onCheckedChange={(e) => setNoProjectFilter(e as any)}
              />
              <Label className="flex flex-col justify-start gap-1 text-left">
                <span className="text-sm font-medium">
                  Show Billing for All Projects
                </span>
              </Label>
            </div>
          </div>
          <div className="mb-4 grid gap-4 md:grid-cols-6">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <DollarSign />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${AWSBillingProcessed.thisMonthTotal}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getDifference(
                    AWSBillingProcessed.thisMonthTotal,
                    AWSBillingProcessed.lastMonthTotal
                  )}{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">
                  Last Month
                </CardTitle>
                <DollarSign />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${AWSBillingProcessed.lastMonthTotal}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getDifference(
                    AWSBillingProcessed.lastMonthTotal,
                    AWSBillingProcessed.thisMonthTotal
                  )}{" "}
                  from this month
                </p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">
                  Year to Date
                </CardTitle>
                <DollarSign />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {sum(
                    Object.values(AWSBillingProcessed.lastTwelveMonths)
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {AWSBillingProcessed.dateRange.start} to{" "}
                  {AWSBillingProcessed.dateRange.end}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-12">
            <Card className="col-span-6">
              <CardHeader>
                <CardTitle>This Month Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <AspectRatio
                  ratio={16 / 7}
                  className="flex items-center justify-center"
                >
                  <ThisMonthBar info={AWSBillingProcessed} />
                </AspectRatio>
              </CardContent>
            </Card>
            <Card className="col-span-6">
              <CardHeader>
                <CardTitle>Last Twelve Months</CardTitle>
              </CardHeader>
              <CardContent>
                <AspectRatio
                  ratio={16 / 7}
                  className="flex items-center justify-center"
                >
                  <LastTwelveMonths info={AWSBillingProcessed} />
                </AspectRatio>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

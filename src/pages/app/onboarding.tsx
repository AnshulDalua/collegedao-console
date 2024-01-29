import { ReactElement, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { AWSCredentialsForm } from "@/components/Core/Credentials/AWS";
import { GCPCredentialsForm } from "@/components/Core/Credentials/GCP";
import Layout from "@/components/Core/Sidebar/Layout";
import { ProviderTabList } from "@/components/Services/CommonInputs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { useAccountStore } from "@/stores/account";

export default function Index() {
  const user = useAccountStore((state) => state.user);
  const router = useRouter();
  const [activeItem, setActiveItem] = useState(1);
  const [defaultProvider, setDefaultProvider] = useState<string>("aws");
  const currentProject = useAccountStore((state) => state.currentProject);

  const connected = useMemo(
    () =>
      Boolean((currentProject?.credentials?.contents as any)?.aws) ||
      Boolean((currentProject?.credentials?.contents as any)?.gcp),
    [currentProject]
  );

  useEffect(() => {
    connected ? setActiveItem(2) : setActiveItem(1);
    if (router.query.code) {
      setDefaultProvider("gcp");
    }
  }, [activeItem, router.query, currentProject?.id]);

  return (
    <>
      <Head>
        <title>Home - Rocetta</title>
      </Head>
      <div className="justify-left mx-auto grid max-w-5xl items-center pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Getting Started
            </h2>
            <p className="text-sm text-muted-foreground">
              Welcome to Rocetta, {user?.name} 👋. Let&apos;s get you started.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-8 pt-8">
          <div className="max-w-xl">
            <Timeline activeItem={activeItem} setActiveItem={setActiveItem}>
              <TimelineItem title="Create an Account" noHelp>
                Looking good! You have already successfully created an account.
                🎉
                <p className="text-sm text-muted-foreground">
                  We have created a project for you but before you can start
                  deploying services you need to add credentials.
                </p>
              </TimelineItem>
              <TimelineItem title="Add credentials">
                Add credentials to deploy and manage your services.
                <Tabs
                  className="max-w-xl pt-4"
                  value={defaultProvider}
                  onValueChange={setDefaultProvider}
                >
                  <ProviderTabList noDisabled></ProviderTabList>
                  <TabsContent value="aws">
                    <AWSCredentialsForm />
                  </TabsContent>
                  <TabsContent value="gcp">
                    <GCPCredentialsForm />
                  </TabsContent>
                </Tabs>
              </TimelineItem>
              <TimelineItem title="Add a service">
                Add a service to your project.
              </TimelineItem>
            </Timeline>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube-nocookie.com/embed/WU0m2mElyp0?si=3JEV4b2HOUBE8lbO"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-52 w-full rounded-lg"
                ></iframe>
                <CardTitle className="test-xs flex items-center">
                  Watch a walkthrough?
                </CardTitle>
                <CardDescription className="text-foreground/80">
                  Watch a walkthrough of Rocetta&apos;s features and how to use
                  them.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

Index.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

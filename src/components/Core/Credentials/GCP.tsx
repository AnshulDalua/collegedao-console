import { toast } from "sonner";
import { match } from "ts-pattern";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import {
  HeroiconsSolidCheckCircle,
  SolarShieldWarningBold,
} from "@/components/Icones";
import { LoadingSmall } from "@/components/Loading";
import { GenericSelect } from "@/components/Services/Generics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, onClickHandler } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountStore } from "@/stores/account";
import {
  createServiceAccount,
  getGoogleCredentialsOAuthUrl,
  provideGoogleCredentialsOAuthCode,
  updateCredentials,
} from "@/utils/api";
import { cn } from "@/utils/cn";
import { read } from "@/utils/file";

import type { ResponseData as GCPProjects } from "@/pages/api/project/credentials/gcp/callback";

export function GCPCredentialsForm(_: React.RefAttributes<HTMLDivElement>) {
  const router = useRouter();
  const refresh = useAccountStore((state) => state.refreshUser);
  const currentProject = useAccountStore((state) => state.currentProject);
  const connected = useMemo(
    () => (currentProject?.credentials?.contents as any)?.gcp,
    [currentProject]
  );

  const [state, setState] = useState<
    "input" | "manual_input" | "loading" | "list" | "updating" | "success"
  >("input");
  const [listOfProjects, setListOfProjects] = useState<GCPProjects["projects"]>(
    []
  );

  useEffect(() => {
    if (router.query.code) {
      setState("loading");
      (async () => {
        const { data } = await provideGoogleCredentialsOAuthCode(
          router.query.code as string
        );
        setState("list");
        setListOfProjects(data.projects);
        router.replace(router.pathname, undefined, { shallow: true });
      })();
    }
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      {connected && (
        <Alert variant="success">
          <HeroiconsSolidCheckCircle
            width={4}
            height={4}
            className="h-4 w-4 fill-green-800 dark:fill-green-100"
          />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You&apos;ve already connected your GCP account. If you need to
            re-add your credentials, follow the steps below again.
          </AlertDescription>
        </Alert>
      )}

      <Alert variant="warning">
        <SolarShieldWarningBold
          width={4}
          height={4}
          className="h-4 w-4 fill-yellow-800 dark:fill-yellow-100"
        />
        <AlertTitle className="py-1.5">Google Pending Approval</AlertTitle>
        <AlertDescription>
          We are currently pending approval from Google Cloud to allow users to
          connect their GCP accounts to Rocetta.
          <ol className="flex list-inside list-decimal flex-col pl-2">
            <li className="py-2 leading-6">
              If you face the error <Code>This app isn&apos;t verified</Code>,
              click on <Code>Advanced</Code> and then{" "}
              <Code>Go to Rocetta (unsafe)</Code>. This is because we are still
              in the process of getting verified by Google.
            </li>
            <li className="pb-2 leading-6">
              If you are unable to connect your GCP account, please try
              inputting your credentials manually below.
            </li>
          </ol>
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="-mt-2 mb-1 flex items-center text-lg">
            <Image
              src="https://api.iconify.design/skill-icons:gcp-dark.svg?color=%23888888"
              alt={"GCP"}
              width={8}
              height={8}
              className="mr-2 h-6 w-6"
              loading="lazy"
              unoptimized
            />
            Connect your GCP Account to Rocetta
          </CardTitle>
          <div className="text-sm text-foreground/80">
            {match(state)
              .with("input", () => (
                <div>
                  {information(false)}
                  <Button
                    className="mt-4 w-full bg-rho-primary/80 text-white shadow hover:bg-rho-primary/75"
                    onClick={(e) =>
                      onClickHandler(e, async () => {
                        const response = await getGoogleCredentialsOAuthUrl();
                        if (!response.ok) return toast.error(response.error);
                        window.open(response.data.url, "_self");
                      })
                    }
                  >
                    <Image
                      src="https://api.iconify.design/solar:shield-keyhole-linear.svg?color=%23FFFFFF"
                      alt="asd"
                      width={24}
                      height={24}
                      className="mr-2 h-5 w-5 "
                      unoptimized
                    />
                    Connect Rocetta via Google Cloud Console
                  </Button>
                  <Button
                    variant="link"
                    className="mt-4"
                    onClick={(e) => {
                      e.preventDefault();
                      setState("manual_input");
                    }}
                  >
                    Add Credentials Manually
                  </Button>
                </div>
              ))
              .with("manual_input", () => (
                <div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const file =
                        e.currentTarget["google-credentials-file"].files[0];
                      const contents = file
                        ? await read(file)
                        : e.currentTarget["google-credentials"].value;

                      const rawCredentials = JSON.parse(contents);

                      toast.promise(
                        updateCredentials({
                          gcp: {
                            GOOGLE_CREDENTIALS: JSON.stringify(rawCredentials),
                            GOOGLE_PROJECT: rawCredentials.project_id,
                          },
                        }),
                        {
                          loading: "Updating credentials...",
                          success: "Updated credentials!",
                          error: "Failed to update credentials",
                        }
                      );
                    }}
                    className="flex flex-col gap-4"
                  >
                    <Label htmlFor="google-credentials">
                      GCP Service Account
                    </Label>

                    <Input
                      type="file"
                      name="google-credentials-file"
                      id="google-credentials-file"
                      className="pt-2"
                      accept=".json"
                    />

                    <Button className="mt-1" type="submit">
                      Add Credentials Manually
                    </Button>
                  </form>
                  <Button
                    variant="link"
                    className="mt-4"
                    onClick={() => setState("input")}
                  >
                    Connect via Google Cloud Console
                  </Button>
                </div>
              ))
              .with("loading", () => (
                <div>
                  <div className="flex flex-col gap-4 py-12">
                    <LoadingSmall className="mx-auto h-6 w-6 animate-spin text-black dark:text-white" />
                    <p className="mx-auto">Loading Google Cloud Projects</p>
                  </div>
                </div>
              ))
              .with("list", () => (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setState("updating");
                    const project = e.currentTarget.project.value;
                    const response = await createServiceAccount(project, "off");

                    if (response.ok) {
                      setState("success");
                      await refresh();
                    } else {
                      toast.error(response.error);
                      setState("input");
                    }
                  }}
                >
                  {information(true)}
                  <div className="mt-4"></div>
                  {listOfProjects.length > 0 ? (
                    <div>
                      <GenericSelect
                        name="project"
                        data={listOfProjects.map((i) => ({
                          name: i.name,
                          description: i.id,
                          value: `projects/${i.id}`,
                        }))}
                      />
                    </div>
                  ) : (
                    <Alert variant="warning" className="w-25 max-w-[500px]">
                      <AlertDescription>
                        Looks like you don&apos;t have any projects in your GCP
                        account. You can create a new project by following this
                        link:{" "}
                        <a
                          href="https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 underline"
                        >
                          Create a new project
                        </a>
                        . Once you&apos;ve created a project, reload this page
                        and try again.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button className="mt-4 w-full" type="submit">
                    Connect
                  </Button>
                </form>
              ))
              .with("updating", () => (
                <div>
                  <div className="flex flex-col gap-4 py-12">
                    <LoadingSmall className="mx-auto h-6 w-6 animate-spin text-black dark:text-white" />
                    <p className="mx-auto">Updating Credentials...</p>
                  </div>
                </div>
              ))
              .with("success", () => (
                <div>
                  <div className="flex flex-col gap-4 py-12">
                    <Image
                      src="https://api.iconify.design/solar:check-circle-bold.svg?color=%23166534"
                      alt="asd"
                      width={24}
                      height={24}
                      className="mx-auto h-24 w-24"
                      unoptimized
                    />
                    <p className="mx-auto">Updated credentials!</p>
                    <Button
                      variant="default"
                      className="mx-auto"
                      size="sm"
                      onClick={() => setState("input")}
                    >
                      Reupdate Credentials
                    </Button>
                  </div>
                </div>
              ))
              .exhaustive()}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

const information = (crossed: boolean) => (
  <>
    To securely connect to Google Cloud, we need to access to your project to
    create a new service account that will be used to access your project.
    <ol className="flex list-inside list-decimal flex-col pl-2">
      <li className={cn("py-2", crossed && "line-through")}>
        Connect your GCP account to Rocetta by clicking the button below.
        You&apos;ll be redirected to Google to select your account that contains
        the project you want to connect.
      </li>
      <li className="py-2">
        You&apos;ll be redirected back to Rocetta where you&apos;ll be able to
        choose the project you want to connect.
        <ol className="list-inside list-[lower-alpha] pl-4  pt-2">
          <li className="text-muted-foreground/70">
            If you don&apos;t see your project, you may need to create a new GCP
            project.
          </li>
        </ol>
      </li>
      <li className="pb-2">
        Once you select your project, Rocetta will automatically add your
        credentials to your account. Return to this page after it has completed
        (it can take a 3-4 minutes).
      </li>
    </ol>
  </>
);

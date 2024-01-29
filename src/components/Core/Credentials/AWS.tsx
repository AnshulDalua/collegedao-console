import { toast } from "sonner";
import { match } from "ts-pattern";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { HeroiconsSolidCheckCircle } from "@/components/Icones";
import { LoadingSmall } from "@/components/Loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, onClickHandler } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountStore } from "@/stores/account";
import { useRealtime } from "@/stores/realtime";
import { getAWSCloudformationUrl, updateCredentials } from "@/utils/api";

export function AWSCredentialsForm(_: React.HTMLAttributes<HTMLDivElement>) {
  const [state, setState] = useState<
    "input" | "manual_input" | "loading" | "success"
  >("input");
  const currentProject = useAccountStore(
    (state) => state.currentProject
  ) as any;
  const connected = useMemo(
    () => Boolean(currentProject?.credentials?.contents?.aws),
    [currentProject]
  );
  const refresh = useAccountStore((state) => state.refreshUser);
  const socket$ = useRealtime((state) => state.socket$);

  const handleCloudformation = async () => {
    const data = await getAWSCloudformationUrl();
    window.open(data.data.url, "_blank");
    setState("loading");
  };

  useEffect(() => {
    const subscription = socket$.subscribe(({ data }) => {
      if (
        typeof data === "string" &&
        data.includes("aws_handshake_completed")
      ) {
        setState("success");
        refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [socket$]);

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
            You&apos;ve already connected your AWS account. If you need to
            re-add your credentials, follow the steps below again.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="-mt-2 mb-1 flex items-center text-lg">
            <Image
              src="https://api.iconify.design/skill-icons:aws-dark.svg?color=%23888888"
              alt={"AWS"}
              width={8}
              height={8}
              className="mr-2 h-6 w-6"
              loading="lazy"
              unoptimized
            />
            Connect your AWS Account to Rocetta
          </CardTitle>
          <div className="text-sm text-foreground/80">
            {match(state)
              .with("input", () => (
                <div>
                  To securely connect to AWS, we require a IAM User to be
                  created.
                  <ol className=" flex list-inside list-decimal flex-col pl-2">
                    <li className="py-2">
                      Connect your AWS account to Rocetta by clicking the button
                      below. You&apos;ll be redirected to the AWS console. Log
                      in if you&apos;re not already.
                    </li>
                    <li className="py-2">
                      You&apos;ll be prompted to create a stack using
                      CloudFormation. Check the box to acknowledge that
                      CloudFormation will create IAM resources then click{" "}
                      <span className="font-bold">Create stack</span>.
                      <ol className="list-inside list-[lower-alpha] pl-4  pt-2">
                        <li>
                          Note: The CloudFormation template will let you know
                          that{" "}
                          <Code>
                            &quot;The following resource(s) require
                            capabilities: [AWS::IAM::User,
                            AWS::IAM::Role].&quot;
                          </Code>{" "}
                          This is expected and safe to proceed.
                        </li>
                      </ol>
                    </li>
                    <li className="pb-2">
                      {" "}
                      Once the stack is created, Rocetta will automatically add
                      your credentials to your account. Return to this page
                      after it has completed (it can take a 3-4 minutes).
                    </li>
                  </ol>
                  <Button
                    className="mt-4 w-full bg-rho-primary/80 text-white shadow hover:bg-rho-primary/75"
                    onClick={(e) => onClickHandler(e, handleCloudformation)}
                  >
                    <Image
                      src="https://api.iconify.design/solar:shield-keyhole-linear.svg?color=%23FFFFFF"
                      alt="asd"
                      width={24}
                      height={24}
                      className="mr-2 h-5 w-5 "
                      unoptimized
                    />
                    Connect Rocetta via AWS Console
                  </Button>
                  <Button
                    variant="link"
                    className="mt-4"
                    onClick={() => setState("manual_input")}
                  >
                    Add Credentials Manually
                  </Button>
                </div>
              ))
              .with("manual_input", () => (
                <div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.currentTarget);
                      const accessKeyId = data.get("access-key-id");
                      const secretAccessKey = data.get("secret-key-id");
                      setState("loading");

                      if (!accessKeyId || !secretAccessKey) {
                        return toast.error("Please fill in all fields. ");
                      }

                      toast.promise(
                        updateCredentials({
                          aws: {
                            AWS_ACCESS_KEY_ID: accessKeyId as string,
                            AWS_SECRET_ACCESS_KEY: secretAccessKey as string,
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
                    <Label htmlFor="access-key-id">AWS Access Key ID</Label>
                    <Input
                      type="password"
                      name="access-key-id"
                      id="access-key-id"
                      required
                    />
                    <Label htmlFor="secret-key-id">AWS Secret Access Key</Label>
                    <Input
                      type="password"
                      name="secret-key-id"
                      id="secret-key-id"
                      required
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
                    Connect via AWS Console
                  </Button>
                </div>
              ))
              .with("loading", () => (
                <div>
                  <div className="flex flex-col gap-4 py-12">
                    <LoadingSmall className="mx-auto h-6 w-6 animate-spin text-black dark:text-white" />
                    <p className="mx-auto">Updating Credentials...</p>
                  </div>
                  <Button
                    variant="link"
                    className="h-0 p-0"
                    onClick={() => setState("input")}
                  >
                    Go Back
                  </Button>
                </div>
              ))
              .with("success", () => (
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
              ))
              .exhaustive()}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

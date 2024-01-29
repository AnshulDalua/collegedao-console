import { match } from "ts-pattern";
import wretch from "wretch";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import GoogleOAuth from "@/components/Auth/GoogleOAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PinInput,
  PinInputControl,
  PinInputField,
} from "@/components/ui/pin-input";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/utils/cn";

import type { Response as AuthResponse } from "@/pages/api/auth/login";
import type { Response as AuthVerifyResponse } from "@/pages/api/auth/login/verify";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [stage, setStage] = useState<"initial" | "verify">("initial");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setUserandToken = useAuthStore((state) => state.setUserandToken);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.target as any);

    if (stage === "initial") {
      const formEmail = formData.get("email")?.toString();
      if (!formEmail) {
        setError("Email is required");
        return setIsLoading(false);
      }

      const login = await wretch()
        .url("/api/auth/login")
        .post({
          email: formEmail,
        })
        .badRequest((error) => error.json)
        .json<AuthResponse>();

      if (!login.ok) {
        setError(login.error ?? "Unknown error");
        return setIsLoading(false);
      }
      setEmail(formEmail);
      setStage("verify");
      setIsLoading(false);
      (event.target as any).reset();
    } else if (stage === "verify") {
      const code = formData.get("code")?.toString();

      if (!code) {
        setError("Code is required");
        return setIsLoading(false);
      }

      const login = await wretch()
        .url("/api/auth/login/verify")
        .post({
          email: email,
          code,
        })
        .badRequest((error) => error.json)
        .json<AuthVerifyResponse>();

      if (!login.ok) {
        setError(login.error ?? "Unknown error");
        return setIsLoading(false);
      }
      setUserandToken(login.data.token);
      router.push("/app");
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {error && error.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={onSubmit} id="login-form">
        <div className="grid gap-3">
          <div className="grid gap-1">
            {match(stage)
              .with("initial", () => (
                <>
                  <Label className="py-1" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </>
              ))
              .with("verify", () => (
                <>
                  <div className="-mt-2 py-1">
                    <Label className="" htmlFor="code">
                      Please provide a code
                    </Label>
                    <CardDescription className="text-sm">
                      Check your email for the code. It may take a few minutes
                      to arrive.
                      <span className="text-muted-background overflow-hidden">
                        {email && ` Sent to ${email}`}
                      </span>
                    </CardDescription>
                  </div>
                  <PinInput
                    otp
                    placeholder=""
                    className="py-1"
                    onComplete={() =>
                      (
                        document.getElementById("login-form") as HTMLFormElement
                      ).requestSubmit()
                    }
                    name="code"
                  >
                    <PinInputControl>
                      <PinInputField index={0} />
                      <PinInputField index={1} />
                      <PinInputField index={2} />
                      <PinInputField index={3} />
                      <PinInputField index={4} />
                      <PinInputField index={5} />
                    </PinInputControl>
                  </PinInput>
                  <div className="justify-left flex flex-row">
                    <Button
                      className="mt-2 px-0 text-right"
                      type="button"
                      size={"sm"}
                      variant="link"
                      disabled={isLoading || isGoogleLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        if (!email) return setStage("initial");
                        const login = await wretch()
                          .url("/api/auth/login")
                          .post({
                            email: email,
                          })
                          .badRequest((error) => error.json)
                          .json<AuthResponse>();

                        if (!login.ok) {
                          setError(login.error ?? "Unknown error");
                          return setIsLoading(false);
                        }
                        setEmail(email);
                        setIsLoading(false);
                      }}
                    >
                      Resend Code
                    </Button>
                  </div>
                </>
              ))
              .exhaustive()}
          </div>
          <Link
            className="mt-1 text-sm text-muted-foreground"
            href={"mailto:support@rocetta.com"}
          >
            Can&apos;t access your email?{" "}
          </Link>
          <Button disabled={isLoading} className="mt-3">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <GoogleOAuth
            isLoading={isLoading}
            setError={setError}
            frontText={"Sign in"}
            isGoogleLoading={isGoogleLoading}
            setIsGoogleLoading={setIsGoogleLoading}
          />
        </div>
      </form>
    </div>
  );
}

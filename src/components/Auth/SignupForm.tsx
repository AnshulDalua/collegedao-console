import { match } from "ts-pattern";
import wretch from "wretch";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/router";

import GoogleOAuth from "@/components/Auth/GoogleOAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

import type { Response as AuthResponse } from "@/pages/api/auth/signup";
import type { Response as AuthVerifyResponse } from "@/pages/api/auth/signup/verify";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"initial" | "verify">("initial");
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();
  const setUserandToken = useAuthStore((state) => state.setUserandToken);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as any);

    if (stage === "initial") {
      const name = formData.get("name")?.toString();
      const emailForm = formData.get("email")?.toString();
      if (!emailForm) {
        setError("Email is required");
        return setIsLoading(false);
      }
      if (!name) {
        setError("Name is required");
        return setIsLoading(false);
      }

      setName(name);
      setEmail(emailForm);

      const signup = await wretch()
        .url("/api/auth/signup")
        .post({ name, email: emailForm })
        .badRequest((error) => error.json)
        .json<AuthResponse>();

      if (!signup.ok) {
        setError(signup.error ?? "Unknown error");
        return setIsLoading(false);
      }

      setError(null);
      setStage("verify");
      (event.target as any).reset();
      setEmail(emailForm);
      setIsLoading(false);
    } else if (stage === "verify") {
      const code = formData.get("code")?.toString();

      if (!code) {
        setError("Code is required");
        return setIsLoading(false);
      }

      const signup = await wretch()
        .url("/api/auth/signup/verify")
        .post({ email, code })
        .badRequest((error) => error.json)
        .json<AuthVerifyResponse>();

      if (!signup.ok) return setError(signup.error ?? "Unknown error");
      setError(null);
      setIsLoading(false);
      setUserandToken(signup.data.token);
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
      <form onSubmit={onSubmit} id="signup-form">
        <div className="grid gap-3">
          {match(stage)
            .with("initial", () => (
              <>
                <div className="grid gap-1">
                  <Label className="py-1" htmlFor="name">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="James Bond"
                    type="name"
                    autoCapitalize="none"
                    autoComplete="name"
                    autoCorrect="off"
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </div>
                <div className="grid gap-1">
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
                </div>
                <div className="mt-3 flex items-center space-x-2 pb-1">
                  <Checkbox id="terms" required />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I&apos;ve read and agree to the{" "}
                    <a
                      href="https://planetscale.com/legal/privacy"
                      className="text-blue-600"
                      target="_blank"
                    >
                      Terms of Service
                    </a>
                  </label>
                </div>
              </>
            ))
            .with("verify", () => (
              <div className="grid gap-1">
                <div className="-mt-2 py-1">
                  <Label className="" htmlFor="code">
                    Please provide a code
                  </Label>
                  <CardDescription className="text-sm">
                    Check your email for the code. It may take a few minutes to
                    arrive.
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
                      document.getElementById("signup-form") as HTMLFormElement
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
                        .url("/api/auth/signup")
                        .post({
                          email: email,
                          name: name,
                        })
                        .badRequest((error) => error.json)
                        .json<AuthResponse>();

                      if (!login.ok) {
                        setError(login.error ?? "Unknown error");
                        return setIsLoading(false);
                      }
                      setIsLoading(false);
                    }}
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            ))
            .exhaustive()}

          <Button disabled={isLoading || isGoogleLoading} className="mt-3">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up with Email
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
            frontText={"Sign up"}
            isGoogleLoading={isGoogleLoading}
            setIsGoogleLoading={setIsGoogleLoading}
          />
        </div>
      </form>
    </div>
  );
}

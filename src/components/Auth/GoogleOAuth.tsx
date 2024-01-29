import wretch from "wretch";
import { useEffect } from "react";
import { useRouter } from "next/router";

import GoogleIcon from "@/components/icons/Google";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useAuthStore } from "@/stores/auth";
import { EventFor } from "@/types/eventFor";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  frontText: "Sign in" | "Sign up";
  setError: (error: string) => void;
  isGoogleLoading: boolean;
  setIsGoogleLoading: (isLoading: boolean) => void;
}

export default function GoogleOAuth(props: UserAuthFormProps) {
  const setUserandToken = useAuthStore((state) => state.setUserandToken);
  const router = useRouter();

  useEffect(() => {
    if (router.query.code) {
      props.setIsGoogleLoading(true);
      (async () => {
        const login = await wretch()
          .url("/api/auth/google")
          .put({
            code: router.query.code as string,
          })
          .badRequest((error) => error.json)
          .json<any>();

        if (!login.ok) {
          props.setError(login.error ?? "Unknown error");
          return props.setIsGoogleLoading(false);
        }

        setUserandToken(login.data.token);
        router.push("/app");
      })();
    }
  }, [router]);

  async function onSubmitGoogle(event: EventFor<"button", "onClick">) {
    event.preventDefault();
    props.setIsGoogleLoading(true);

    const login = await wretch()
      .url("/api/auth/google")
      .post()
      .badRequest((error) => error.json)
      .json<any>();

    if (!login.ok) {
      props.setError(login.error ?? "Unknown error");
      return props.setIsGoogleLoading(false);
    }

    const url = login.data.url;
    window.open(url, "_self");
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={props.isLoading || props.isGoogleLoading}
      onClick={onSubmitGoogle}
    >
      {props.isGoogleLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}{" "}
      {props.frontText} with Google
    </Button>
  );
}

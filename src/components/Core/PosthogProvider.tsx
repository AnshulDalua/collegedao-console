import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { useAccountStore } from "@/stores/account";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    api_host: "/hoggy",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug()
    },
  });
}

export default function PosthogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const posthog = usePostHog();
  const user = useAccountStore((state) => state.user);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });
    }
  }, [user, posthog]);

  useEffect(() => {
    const handleRouteChange = () => posthog?.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

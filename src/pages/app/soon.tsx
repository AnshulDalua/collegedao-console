import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
import { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";

import Layout from "@/components/Core/Sidebar/Layout";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    if (router.query.what === undefined) return;
    posthog.capture("coming_soon_page_viewed", {
      properties: {
        what: router.query.what,
      },
    });
  }, [posthog, router]);

  return (
    <main className="mx-auto px-12 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-5xl">
          Coming Soon
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          We are working hard to bring you this feature. Stay tuned!
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            onClick={() => router.back()}
            className="rounded-md bg-rho-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rho-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rho-primary"
          >
            Go back
          </Button>
          <Button
            onClick={(e) => {
              toast.success(
                "You have signup for early access! Please stay tuned."
              );
              posthog.capture("early_access_requested", {
                properties: {
                  what: router.query.what ?? "n/a",
                },
              });
              e.currentTarget.innerText = "Requested!";
              e.currentTarget.disabled = true;
            }}
            className="rounded-md bg-rho-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rho-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rho-primary"
          >
            Request Access
          </Button>
        </div>
      </div>
    </main>
  );
}
/** @LAYOUT */
ComingSoon.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

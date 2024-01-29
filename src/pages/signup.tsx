import { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { UserAuthForm } from "@/components/Auth/SignupForm";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/stores/auth";
import Background from "@/../public/frame4.png";

export default function Signup() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const email =
        new URLSearchParams(window?.location.search).get("email") ?? "";
      if (email) {
        (document.getElementById("email") as HTMLInputElement).value = email;
        (document.getElementById("password") as HTMLInputElement)?.focus();
      }
    }
  }, []);
  useEffect(() => {
    if (status === "on") router.push("/app");
  }, [router, status]);

  return (
    <>
      <Head>
        <title>Signup - Rocetta</title>
      </Head>
      <>
        <div className="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="lg:p-8">
            <div className="mx-auto flex w-[350px] flex-col justify-center space-y-4">
              <div className="absolute left-5 top-5 z-20 flex items-center text-lg font-medium">
                <Logo />
              </div>
              <div className="flex flex-col space-y-2 text-left">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Signup for an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600">
                    Sign in.
                  </Link>
                </p>
              </div>
              <UserAuthForm />
            </div>
          </div>
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
            <div className="absolute inset-0 bg-[#D9D9D9]" />
            <Image
              className="relative m-auto drop-shadow-md"
              src={Background}
              placeholder="blur"
              width={800}
              height={800}
              alt=""
            />
          </div>
        </div>
      </>
    </>
  );
}

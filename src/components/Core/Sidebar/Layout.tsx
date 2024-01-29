/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

import { Footer } from "@/components/Core/Footer";
import FullLogo from "@/components/FullLogo";
import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";
import { useModal } from "@/stores/modal";
import { useRealtime } from "@/stores/realtime";
import { cn } from "@/utils/cn";

interface LayoutProps {
  children: React.ReactNode;
}

const ErrorModal = dynamic(() => import("@/components/Services/ErrorModal"));
const RecommendationEngine = dynamic(
  () => import("@/components/Core/Recommendation/Chat")
);
const UserSettingsModal = dynamic(
  () => import("@/components/Core/Sidebar/Settings/UserSettings")
);
const ProjectSettingsModal = dynamic(
  () => import("@/components/Core/Sidebar/Settings/ProjectSettings")
);
const Header = dynamic(() => import("@/components/Core/Sidebar/Header"));
const Navigation = dynamic(
  () => import("@/components/Core/Sidebar/Navigation")
);
const SidebarFooter = dynamic(
  () => import("@/components/Core/Sidebar/SidebarFooter")
);
const MutateRealtime = dynamic(() =>
  import("@/hooks/useRealtime").then((mod) => mod.MutateRealtime)
);

function Layout({ children }: LayoutProps) {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  const currentProject = useAccountStore((state) => state.currentProject);
  const setCurrentProject = useAccountStore((state) => state.setCurrentProject);
  const getDefaultProject = useAccountStore((state) => state.getDefaultProject);
  const projects = useAccountStore((state) => state.projects);
  const realtimeInit = useRealtime((state) => state.init);
  const token = useAuthStore((state) => state.token);
  const [openError] = useModal("error");
  const [openUserSettings] = useModal("userSettings");
  const [openProjectSettings] = useModal("projectSettings");
  const [openOnboarding] = useModal("onboarding");

  /* Redirect to Login Page if not Logged In */
  useEffect(() => {
    if (typeof window !== "undefined" && status === "off")
      router.push("/login");
  }, [router, status]);

  /* Set Current Project */
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(getDefaultProject());
    }
  }, [currentProject, getDefaultProject, projects, setCurrentProject]);

  /* Initialize Realtime */
  useEffect(() => {
    if (currentProject && token) {
      realtimeInit(token, currentProject?.id);
    }
  }, [currentProject, token, realtimeInit]);

  /* Onboarding */
  useEffect(() => {
    if (openOnboarding && router.pathname !== "/app/onboarding") {
      const onboarding = sessionStorage.getItem("onboarding");
      if (onboarding) return;
      router.push("/app/onboarding");
      sessionStorage.setItem("onboarding", "true");
    }
  }, [openOnboarding, router]);

  /* Playground Conditional */
  const playground = useMemo(() => {
    return router.pathname.includes("/playground");
  }, [router.pathname]);

  if (!currentProject || status === "off") return null;

  return (
    <>
      {openError && <ErrorModal />}
      {openUserSettings && <UserSettingsModal />}
      {openProjectSettings && <ProjectSettingsModal />}
      <RecommendationEngine />
      <MutateRealtime />

      <div className="relative lg:ml-[17rem] lg:mr-[1.5rem]">
        <div className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex">
          <div
            id="sidebar"
            className="contents w-[250px] border-light-stroke bg-light-primary p-[0.75rem] shadow-sm dark:border-dark-stroke dark:bg-dark-tertiary lg:pointer-events-auto lg:block lg:overflow-y-auto lg:border-r"
          >
            <div className={"flex h-full flex-col justify-between"}>
              <div>
                <div className="ml-[0.25rem] hidden lg:flex">
                  <Link href="/" aria-label="Home">
                    <FullLogo className="h-8" />
                  </Link>
                  <div className="ml-2 flex items-center">
                    <span className="mt-[1px] flex h-4 flex-1 items-center rounded-lg bg-rho-secondary/10 px-1.5 font-mono text-[0.625rem] font-semibold leading-6 text-rho-secondary ring-1 ring-inset ring-rho-secondary dark:text-rho-secondary dark:ring-rho-secondary/30">
                      Beta
                    </span>
                  </div>
                </div>
                <Header />
                <Navigation className="hidden w-[220px] lg:mt-4 lg:block" />
              </div>
              <SidebarFooter className=" hidden lg:grid lg:grid-cols-2 lg:gap-2" />
            </div>
          </div>
        </div>
        <div
          className={cn("h-full w-full", playground ? "fixed" : "mt-14 px-4")}
        >
          <main className={cn("h-full w-full", !playground && "py-4")}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default memo(Layout);

import { ReactElement, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import Layout from "@/components/Core/Sidebar/Layout";
import { navigation } from "@/components/Core/Sidebar/Navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAccountStore } from "@/stores/account";
import { useModal } from "@/stores/modal";
import { abbreviate } from "@/utils/abbr";
import { cn } from "@/utils/cn";

export default function Index() {
  const projects = useAccountStore((state) => state.projects);
  const setCurrentProject = useAccountStore((state) => state.setCurrentProject);
  const user = useAccountStore((state) => state.user);
  const [_, setOnboarding] = useModal("onboarding");

  const isMorning = useMemo(() => {
    const hours = new Date().getHours();
    return hours > 6 && hours < 12;
  }, []);

  return (
    <>
      <Head>
        <title>Home - Rocetta</title>
      </Head>
      <div className="px-4">
        <div className="flex items-center justify-between py-4">
          <div className="space-y-4 text-center md:text-left">
            <h2 className=" text-4xl font-semibold tracking-tight">
              {isMorning ? "Good morning" : "Good afternoon"},{" "}
              <br className="sm:hidden" />
              {user?.name ?? "User"}
            </h2>
            <p className="text-md max-w-lg text-muted-foreground">
              Welcome to Rocetta! A platform designed for you to build, deploy,
              and manage your cloud across providers like Amazon Web Services
              and Google Cloud.
            </p>
            <div className="grid grid-flow-row justify-center space-x-2 pb-4 md:grid-flow-col">
              {CallToAction.map((action, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center gap-6 space-y-3 rounded-xl p-6 transition-transform hover:scale-95 hover:bg-gray-200 dark:hover:bg-zinc-800 md:max-w-xs"
                  onClick={() => action.onClick({ setOnboarding })}
                >
                  <div className=" h-18 min-w-18 grid items-center justify-center overflow-hidden rounded-md text-gray-600">
                    <Image
                      src={action.icon}
                      alt={action.title}
                      height={48}
                      width={48}
                      unoptimized
                      className=" h-12 w-12 invert dark:invert-0"
                    />
                  </div>
                  <div className="space-y-1 text-center text-sm">
                    <h3 className="text-left font-medium leading-none">
                      {action.title}
                    </h3>
                    <p className="text-left text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Quick Select
            </h2>
            <p className="text-sm text-muted-foreground">
              Quick access to the different parts of Rocetta
            </p>
          </div>
        </div>
        <div className="my-4" />
        <div className="relative">
          <ScrollArea>
            <QuickSelect />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Project Select
            </h2>
            <p className="text-sm text-muted-foreground">
              Quick access to your projects
            </p>
          </div>
        </div>
        <div className="my-4" />
        <div className="relative">
          <ScrollArea>
            <div className="flex space-x-4 overflow-visible pb-4">
              {projects
                .sort(
                  (a, b) =>
                    new Date(a.updatedAt).getTime() -
                    new Date(b.updatedAt).getTime()
                )
                .map((project) => (
                  <div
                    key={project.id}
                    className={"space-y-3 transition-transform hover:scale-95"}
                  >
                    <div
                      className="relative cursor-pointer overflow-hidden rounded-md"
                      onClick={() => setCurrentProject(project)}
                    >
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <h1 className="text-8xl font-semibold text-white">
                          {abbreviate(project?.name ?? "")}
                        </h1>
                      </div>
                      <Image
                        src={`https://source.boringavatars.com/marble/200/${project?.id}?square`}
                        alt={project?.name ?? ""}
                        width={100}
                        height={100}
                        unoptimized
                        className="aspect-square min-h-[200px] min-w-[200px] object-cover"
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <h3 className="font-medium leading-none">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {project.id}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

export function QuickSelect() {
  const router = useRouter();

  const services = useMemo(
    () =>
      (
        [] as {
          title: string;
          href: string;
          tag?: string;
          icon: any;
        }[]
      ).concat(navigation[1].links, navigation[2].links),
    []
  );

  return (
    <div className="grid grid-flow-col space-x-2 pb-4">
      {services.map((services, index) => (
        <div
          key={index}
          className={cn(
            "grid-row-auto grid items-center space-y-3 rounded-xl p-6 transition-transform hover:scale-95 hover:bg-gray-200 dark:hover:bg-zinc-800",
            services.tag === "soon"
              ? "cursor-not-allowed opacity-50	"
              : "cursor-pointer"
          )}
          onClick={() => router.push(services.href)}
          aria-disabled={services.tag === "soon"}
        >
          <div className=" h-18 min-w-18 grid  items-center justify-center overflow-hidden rounded-md text-gray-600">
            <services.icon className=" h-12 w-12 text-black dark:text-white " />
          </div>
          <div className="space-y-1 text-center text-sm">
            <h3 className="font-medium leading-none">{services.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

const CallToAction = [
  // {
  //   title: "Create a New Project",
  //   description: "Create a new project to get started with Rocetta",
  //   icon: "https://api.iconify.design/ic:baseline-add.svg?color=%23fff",
  //   onClick: (ctx: any) => {
  //     console.log(ctx.setCreateProject);
  //     ctx.setUserMenu(true);
  //     ctx.setCreateProject(true);
  //   },
  // },
  {
    title: "View Documentation",
    description: "Learn more about Rocetta and how to use it",
    icon: "https://api.iconify.design/solar:documents-line-duotone.svg?color=%23fff",
    onClick: (_: any) => {
      window.open("https://docs.rocetta.com", "_blank");
    },
  },
  {
    title: "Join Discord",
    description: "Join our Discord community for support and fun",
    icon: "https://api.iconify.design/ic:baseline-discord.svg?color=%23fff",
    onClick: (_: any) => {
      window.open("https://discord.gg/RTrTcJn6dY", "_blank");
    },
  },
  {
    title: "View Onboarding",
    description: "View the onboarding flow to start using Rocetta",
    icon: "https://api.iconify.design/solar:question-circle-bold.svg?color=%23fff",
    onClick: (ctx: any) => {
      ctx.setOnboarding(true);
    },
  },
];

Index.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  useIsInsideMobileNavigation,
  useMobileNavigationStore,
} from "@/components/Core/Sidebar/MobileNavigation";
import { Tag } from "@/components/Tag";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import UserDropdown from "./UserDropdown";

export const navigation = [
  {
    title: "",
    links: [
      {
        title: "Home",
        href: "/app",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarHomeIcon)
        ),
      },
      {
        title: "Billing & Usage",
        href: "/app/billing",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarBillingIcon)
        ),
      },
      {
        title: "Credentials",
        href: "/app/credentials",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarCredentials)
        ),
      },
    ],
  },
  {
    title: "Build",
    links: [
      {
        title: "App Deploy",
        href: "/app/soon?what=appdeploy",
        tag: "soon",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarAppDeploy)
        ),
      },
      {
        title: "Instance",
        href: "/app/instance",
        tag: "",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarInstance)
        ),
      },
      {
        title: "Database",
        href: "/app/database",
        tag: "",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarDatabase)
        ),
      },
      {
        title: "Storage",
        href: "/app/storage",
        tag: "",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarStorage)
        ),
      },
      {
        title: "Serverless",
        href: "/app/soon?what=serverless",
        tag: "soon",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarServerless)
        ),
      },
    ],
  },
  {
    title: "Visual",
    links: [
      {
        title: "Playground",
        href: "/app/playground",
        tag: "beta",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarPlayground)
        ),
      },
      {
        title: "Marketplace",
        href: "/app/soon?what=marketplace",
        tag: "soon",
        icon: dynamic(() =>
          import("@/components/Icones").then((mod) => mod.SidebarMarketplace)
        ),
      },
    ],
  },
] as const;

export default function Navigation(
  props: React.ComponentPropsWithoutRef<"nav">
) {
  const router = useRouter();
  const isInsideMobileNavigation = useIsInsideMobileNavigation();
  const { setOpen } = useMobileNavigationStore();

  return (
    <nav {...props} className={cn("flex flex-col", props.className)}>
      <ul role="list">
        <UserDropdown />
        <div>
          {navigation.map((group, groupIndex) => (
            <li
              key={groupIndex}
              className={cn("relative mt-2", groupIndex === 0 && "md:mt-0")}
            >
              <h2 className="p-[8px] text-xs font-semibold text-light-gray dark:text-dark-gray">
                {group.title}
              </h2>
              <div className="relative">
                <ul role="list" className="">
                  {group.links.map((link, index) => (
                    <li key={link.href + index} className="relative">
                      <Link
                        href={link.href}
                        aria-current={
                          link.href === router.pathname ? "page" : undefined
                        }
                        onClick={() =>
                          isInsideMobileNavigation && setOpen(false)
                        }
                        className="flex flex-1"
                      >
                        <Button
                          variant="sidebar"
                          className={cn(
                            "group/sidebar flex w-full flex-1 justify-between text-light-gray hover:text-dark-primary dark:text-dark-gray hover:dark:text-light-primary",
                            link.href === router.pathname
                              ? "bg-light-quaternary text-dark-primary dark:bg-dark-quaternary/80 dark:text-light-primary"
                              : undefined
                          )}
                          date-open={
                            link.href === router.pathname ? "opened" : "closed"
                          }
                        >
                          <span className="flex flex-1 items-center gap-[8px] text-[14px] font-normal">
                            {link.icon && (
                              <link.icon className="h-4 w-4 text-rho-secondary" />
                            )}
                            {link.title}
                          </span>

                          {"tag" in link && (
                            <Tag variant="small" color="zinc">
                              {link.tag}
                            </Tag>
                          )}
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </div>
      </ul>
    </nav>
  );
}

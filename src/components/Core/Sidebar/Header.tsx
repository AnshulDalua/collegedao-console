import clsx from "clsx";
import { forwardRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

import NavigationMenuHeader from "@/components/Core/Sidebar/HeaderNavigation";
import {
  MobileNavigation,
  useIsInsideMobileNavigation,
  useMobileNavigationStore,
} from "@/components/Core/Sidebar/MobileNavigation";
import ThemeToggle from "@/components/Core/ThemeToggle";
import { Logo } from "@/components/Logo";

const Notifications = dynamic(() => import("@/components/Core/Notifications"), {
  ssr: false,
});

const Header = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className }, ref) => {
  const router = useRouter();
  const { isOpen: mobileNavIsOpen } = useMobileNavigationStore();
  const isInsideMobileNavigation = useIsInsideMobileNavigation();

  return (
    <div
      ref={ref}
      className={clsx(
        className,
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:z-30 lg:px-8 lg:left-[250px] border-b bg-light-primary dark:bg-dark-primary",
        router.pathname === "/app/playground" ? "lg:right-[325px]" : ""
      )}
    >
      <div
        className={clsx(
          "absolute inset-x-0 top-full h-px transition",
          (isInsideMobileNavigation || !mobileNavIsOpen) &&
            "bg-stone-900/7.5 dark:bg-white/7.5"
        )}
      />
      <div className="flex items-center gap-5 lg:hidden">
        <MobileNavigation />
        <div className="flex flex-1 items-center gap-2">
          <Link href="/" aria-label="Home">
            <Logo className="h-6" />
          </Link>
          <span className="mt-[2px] flex h-4 flex-1 items-center rounded-lg bg-rho-secondary/10 px-1.5 font-mono text-[0.625rem] font-semibold leading-6 text-rho-secondary ring-1 ring-inset ring-rho-secondary dark:text-rho-secondary dark:ring-rho-secondary/30">
            Beta
          </span>
        </div>
      </div>
      <div className="justify-right hidden items-center sm:flex ">
        <NavigationMenuHeader />
      </div>
      <div className="flex items-center gap-5 ">
        <div className="flex gap-4">
          <Notifications />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
});

Header.displayName = "Header";

export default Header;

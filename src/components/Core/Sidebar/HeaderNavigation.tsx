import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useModal } from "@/stores/modal";
import { cn } from "@/utils/cn";

export default function NavigationMenuHeader(
  props: React.ComponentProps<typeof NavigationMenu>
) {
  const [_, setRecommendationEngine] = useModal("recommendationEngine");
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            href="https://rocetta.canny.io"
            target="_blank"
          >
            <div className="flex flex-1 items-center">
              <Image
                src={
                  "https://api.iconify.design/icon-park-outline:thumbs-up.svg"
                }
                height={16}
                width={16}
                alt={"Request Feature"}
                className="mr-2 dark:invert"
                unoptimized
              />
              Request Feature
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="#" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              onClick={() => setRecommendationEngine(true)}
            >
              <div className="flex flex-1 items-center">
                <Image
                  src={
                    "https://api.iconify.design/icon-park-outline:brain.svg?color=%23000"
                  }
                  height={16}
                  width={16}
                  alt={"Recommendation Engine"}
                  className="mr-2 dark:invert"
                  unoptimized
                />
                Recommendation Engine
              </div>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

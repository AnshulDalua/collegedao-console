import { useMemo } from "react";
import { useRouter } from "next/router";

import { cn } from "@/utils/cn";

import { navigation } from "./Navigation";

export default function QuickSelect() {
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

import chunk from "lodash/chunk";
import { useMemo, useState } from "react";
import Image from "next/image";

import { LoadingSmall } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWRC } from "@/hooks/useWRC";
import { clearNotifications, editNotification } from "@/utils/api";
import { getRelativeTimeDifference } from "@/utils/date";

import type { ResponseData as Notifications } from "@/pages/api/user/notifications";

const PAGE_SIZE = 4;

export default function Notifications() {
  const {
    data: rawNotifications,
    loading,
    mutate,
  } = useWRC<Notifications>("/api/user/notifications", (chain) => chain, {
    key: "notifications",
  });

  const [page, setPage] = useState(0);

  const notifications = useMemo(() => {
    if (!rawNotifications) return [];
    return chunk(rawNotifications, PAGE_SIZE)[page] as Notifications;
  }, [page, rawNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Image
            src="https://api.iconify.design/material-symbols:notifications-active.svg?color=%23888888"
            unoptimized
            width={24}
            height={24}
            alt="Light mode"
            className="w-5"
          />
          <span className="sr-only">Notifications</span>
          {(notifications?.filter((notification) => !notification.v) ?? [])
            .length > 0 && (
            <span className="-translate-y-1/6 translate-x-1/6 absolute right-0 top-0 inline-flex items-center justify-center rounded-full bg-red-600 p-1 text-xs font-bold leading-none text-red-100" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-md mx-2 flex items-center justify-between pt-2">
          Notifications
          <Button
            className=""
            size="sm"
            variant="link"
            disabled={!rawNotifications || rawNotifications.length === 0}
            onClick={() => clearNotifications().then(() => mutate())}
          >
            Clear all
          </Button>
        </DropdownMenuLabel>
        {loading && (
          <div className="m-2 mx-auto">
            <LoadingSmall className="mx-auto mb-14 mt-10 h-6 w-6 animate-spin" />
          </div>
        )}
        {rawNotifications && notifications && (
          <>
            {notifications.map((notification, index) => (
              <DropdownMenuItem
                key={index + page * PAGE_SIZE}
                onClick={async () => {
                  if (notification.v) return;
                  await editNotification(
                    (index + page * PAGE_SIZE).toString(),
                    {
                      ...notification,
                      v: true,
                    }
                  );
                  mutate();
                }}
              >
                <div className="m-2 flex flex-col">
                  {!notification.v && (
                    <span className="absolute right-0 top-1/2 mr-4 inline-flex items-center justify-center rounded-full bg-blue-600 p-1 text-xs font-bold leading-none text-blue-100" />
                  )}
                  <span className="w-[15rem]">{notification.m}</span>
                  <span className="text-xs text-gray-400">
                    {getRelativeTimeDifference(notification.t.toString())}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}

            {rawNotifications.length > PAGE_SIZE && (
              <div className="mx-2 flex justify-between py-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2 h-6 w-6 rotate-180 rounded-full"
                  disabled={page === 0}
                  onClick={() => setPage((page) => Math.max(0, page - 1))}
                >
                  <Image
                    src="https://api.iconify.design/mdi:chevron-right.svg?color=%23888888"
                    unoptimized
                    width={24}
                    height={24}
                    alt="Previous Page"
                    className="w-5"
                  />
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2 h-6 w-6 rounded-full"
                  disabled={
                    page === Math.ceil(rawNotifications.length / PAGE_SIZE) - 1
                  }
                  onClick={() =>
                    setPage((page) =>
                      Math.min(
                        Math.ceil(rawNotifications.length / PAGE_SIZE) - 1,
                        page + 1
                      )
                    )
                  }
                >
                  <Image
                    src="https://api.iconify.design/mdi:chevron-right.svg?color=%23888888"
                    unoptimized
                    width={24}
                    height={24}
                    alt="Next Page"
                    className="w-5"
                  />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

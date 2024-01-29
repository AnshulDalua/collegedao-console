import Image from "next/image";

import ProjectSwitcher from "@/components/Core/Sidebar/ProjectSwitcher";
import {
  SolarBellLineDuotone,
  SolarLogout2LineDuotone,
  SolarQuestionCircleOutline,
  SolarSettingsLineDuotone,
  SolarUserCheckRoundedLineDuotone,
} from "@/components/Icones";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";
import { useModal } from "@/stores/modal";
import { abbreviate } from "@/utils/abbr";

export default function UserDropdown(
  props: React.ComponentPropsWithoutRef<"div">
) {
  const user = useAccountStore((state) => state.user);
  const off = useAuthStore((state) => state.off);
  const currentProject = useAccountStore((state) => state.currentProject);

  const [, setOpenUserSettings] = useModal("userSettings");
  const [, setOpenProjectSettings] = useModal("projectSettings");

  return (
    <Popover>
      <PopoverTrigger className={props.className} asChild>
        <div>
          <div className="rounded-lg border border-gray-300 p-[0.75rem] shadow-sm focus-within:ring-2 focus-within:ring-rho-secondary focus-within:ring-offset-2 hover:border-gray-400 dark:border-gray-300/10 dark:hover:border-gray-400/50">
            <div className="flex h-8 w-full items-center space-x-3 ">
              <div className="relative">
                <Image
                  className="h-7 w-7 rounded-full"
                  src={`https://source.boringavatars.com/beam/160/${user?.email}?square`}
                  height={7}
                  width={7}
                  alt=""
                  unoptimized
                />
                <Avatar className="absolute left-4 top-4 mr-2 h-3 w-3 rounded-sm shadow-lg">
                  <AvatarImage
                    src={`https://source.boringavatars.com/marble/160/${currentProject?.id}?square`}
                  />
                  <AvatarFallback className="h-2 w-2">
                    {abbreviate(currentProject?.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-left">
                <a href="#" className="focus:outline-none">
                  <p className="font-regular text-sm text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-300">
                    {currentProject?.name ?? ""}
                  </p>
                </a>
              </div>
              <Image
                src="https://api.iconify.design/heroicons-solid:chevron-up-down.svg?color=%23888888"
                width={5}
                height={5}
                alt="Checkcircle"
                className="-mr-1 ml-2 h-4 w-4 dark:fill-white"
                aria-hidden="true"
                unoptimized
              />
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        className="grid w-[250px] items-center divide-y rounded-lg bg-card p-0 shadow-2xl"
        hideWhenDetached
      >
        <div className="flex flex-1 items-center gap-4 px-4 py-3">
          <div className="shrink-0">
            <Image
              className="h-7 w-7 rounded-full"
              src={`https://source.boringavatars.com/beam/160/${user?.email}?square`}
              height={7}
              width={7}
              alt=""
              unoptimized
            />
          </div>
          <div className="justify-left flex flex-col">
            <p className="text-md font-medium text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-300">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center bg-foreground/5 px-4 py-3">
          <ProjectSwitcher />
        </div>
        <div className="flex flex-1 cursor-pointer items-center px-4 py-3 hover:bg-foreground/5">
          <SolarQuestionCircleOutline className="mr-2 h-5 w-5 text-rho-secondary dark:text-rho-primary" />
          <p className="text-sm">Help Center</p>
        </div>
        <div className="flex flex-1 cursor-pointer items-center px-4 py-3 hover:bg-foreground/5">
          <SolarBellLineDuotone className="mr-2 h-5 w-5 text-rho-secondary dark:text-rho-primary" />
          <p className="text-sm">Notifications</p>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center px-4 py-3 hover:bg-foreground/5"
          onClick={() => setOpenProjectSettings(true)}
        >
          <SolarSettingsLineDuotone className="mr-2 h-5 w-5 text-rho-secondary dark:text-rho-primary" />
          <p className="text-sm">Project Settings</p>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center px-4 py-3 hover:bg-foreground/5"
          onClick={() => setOpenUserSettings(true)}
        >
          <SolarUserCheckRoundedLineDuotone className="mr-2 h-5 w-5 text-rho-secondary dark:text-rho-primary" />
          <p className="text-sm">User Settings</p>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center px-4 py-3 hover:bg-foreground/5"
          onClick={off}
        >
          <SolarLogout2LineDuotone className="mr-2 h-5 w-5 text-rho-secondary dark:text-rho-primary" />
          <p className="text-sm">Logout</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

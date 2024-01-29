import React, { forwardRef } from "react";
import Image from "next/image";

import { SolarQuestionCircleLineDuotone } from "@/components/Icones";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

const SidebarFooter = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div {...props} ref={ref} className={cn(className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="sidebar"
            className="group/sidebar col-span-2 flex w-full flex-1 justify-between text-light-gray hover:text-dark-primary dark:text-dark-gray hover:dark:text-light-primary"
          >
            <span className="flex flex-1 items-center gap-[8px] text-[14px] font-normal">
              <SolarQuestionCircleLineDuotone className="h-4 w-4 text-black dark:text-white " />
              Support
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent asChild>
          <ul className="m-2 grid gap-2 p-2 md:w-[400px]">
            <ListItem
              href="https://discord.gg/RTrTcJn6dY"
              target="_blank"
              className="max-h-full"
              title={
                (
                  <div className="flex flex-1 items-center">
                    <Image
                      src={
                        "https://api.iconify.design/ic:baseline-discord.svg?color=%23000"
                      }
                      height={16}
                      width={16}
                      alt={"Discord"}
                      className="mr-2 dark:invert"
                      unoptimized
                    />
                    Discord Server
                  </div>
                ) as any
              }
            >
              For bug report or customer support, please join our Discord
              community!
            </ListItem>
            <ListItem
              href="mailto:support@rocetta.com"
              target="_blank"
              title={
                (
                  <div className="flex flex-1 items-center">
                    <Image
                      src={
                        "https://api.iconify.design/material-symbols:mail-rounded.svg?color=%23000"
                      }
                      height={16}
                      width={16}
                      alt={"Email"}
                      className="mr-2 dark:invert"
                      unoptimized
                    />
                    Email
                  </div>
                ) as any
              }
            >
              Get in touch with us via email.
            </ListItem>
            <ListItem
              href="https://docs.rocetta.com"
              target="_blank"
              title={
                (
                  <div className="flex flex-1 items-center">
                    <Image
                      src={
                        "https://api.iconify.design/material-symbols:docs.svg?color=%23000"
                      }
                      height={16}
                      width={16}
                      alt={"Email"}
                      className="mr-2 dark:invert"
                      unoptimized
                    />
                    Documentation
                  </div>
                ) as any
              }
            >
              View our documentation.
            </ListItem>
          </ul>
        </PopoverContent>
      </Popover>
      <Button
        variant="sidebar"
        className="group/sidebar col-span-2 flex w-full flex-1 justify-between text-light-gray hover:text-dark-primary dark:text-dark-gray hover:dark:text-light-primary"
        onClick={() => window.open("https://docs.rocetta.com", "_blank")}
      >
        <span className="flex flex-1 items-center gap-[8px] text-[14px] font-normal">
          <Image
            src="https://api.iconify.design/solar:documents-line-duotone.svg?color=%23000"
            height={16}
            width={16}
            alt={"Help"}
            className=" h-4 w-4 invert-0 dark:invert"
            unoptimized
          />
          Docs
        </span>
      </Button>
      <div className="col-span-2 mt-4 flex h-[25px] w-full flex-col justify-between">
        <div></div>
        <svg
          width="24"
          height="17"
          viewBox="0 0 24 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-2"
        >
          <g filter="url(#filter0_i_1343_883)">
            <path
              d="M8.77625 3.05747C7.58147 1.86268 5.65519 1.86268 4.46041 3.05747L0.144531 7.37337C1.33932 6.17859 3.26562 6.17859 4.46041 7.37337"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M4.45785 7.38876L6.61304 9.54395L10.9234 5.23357L8.76822 3.07839L4.45785 7.38876Z"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M19.5536 0.899507C18.3588 -0.295278 16.4325 -0.295278 15.2377 0.899507L10.9219 5.21541C12.1167 4.02063 14.0429 4.02063 15.2377 5.21541"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M15.2398 5.22592L17.395 7.3811L21.7054 3.07073L19.5502 0.915547L15.2398 5.22592Z"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M21.7116 7.37363C20.5168 6.17884 18.5905 6.17884 17.3957 7.37363L13.0798 11.6894C14.2746 10.4946 16.2009 10.4946 17.3957 11.6894"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M17.3902 11.6925L19.5454 13.8477L23.8558 9.53729L21.7006 7.3821L17.3902 11.6925Z"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M10.9342 9.53134C9.73943 8.33656 7.81315 8.33656 6.61837 9.53134L2.30249 13.8472C3.49728 12.6525 5.42358 12.6525 6.61837 13.8472"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M6.61703 13.8465L8.77222 16.0017L13.0826 11.6913L10.9274 9.53615L6.61703 13.8465Z"
              fill="white"
              fillOpacity="0.2"
            />
          </g>
          <defs>
            <filter
              id="filter0_i_1343_883"
              x="0.144531"
              y="0.00341797"
              width="23.7112"
              height="16.9982"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="0.999898" />
              <feGaussianBlur stdDeviation="0.999898" />
              <feComposite
                in2="hardAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="shape"
                result="effect1_innerShadow_1343_883"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
});

SidebarFooter.displayName = "SidebarFooter";

export const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
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
    </li>
  );
});
ListItem.displayName = "ListItem";

export default SidebarFooter;

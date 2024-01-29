import { useTheme } from "next-themes";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Image
            src={
              "https://api.iconify.design/ic:baseline-light-mode.svg?color=%23888888"
            }
            unoptimized
            width={24}
            height={24}
            alt="Light mode"
            className="w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Image
            src={
              "https://api.iconify.design/ic:baseline-dark-mode.svg?color=%23888888"
            }
            unoptimized
            width={24}
            height={24}
            alt="Dark mode"
            className="absolute w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

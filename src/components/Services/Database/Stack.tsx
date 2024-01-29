import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Image from "next/image";

import DefaultActions from "@/components/Services/Commons/Actions";
import {
  DateRow,
  ProviderRow,
  RegionRow,
  StatusRow,
} from "@/components/Services/Commons/Rows";
import {
  GenericRow,
  GenericRowTitle,
  GenericRowValue,
} from "@/components/Services/Generics";
import { engineToEngine } from "@/components/Services/Util";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/stores/modal";
import { InitialStackInformation } from "@/types/stack";

import { MACHINE_SIZES } from "./Create";

interface StackProps extends InitialStackInformation {
  type: string;
  size: string;
}

export default function DatabaseStack(props: StackProps) {
  const [, setConnectOpen] = useModal("connect", "database");
  const [, setUpdateOpen] = useModal("update", "database");
  const type = engineToEngine(props.type);

  return (
    <Card className="max-w-5xl shadow-sm">
      <div className="grid grid-flow-col items-center justify-between gap-8 p-6">
        <div className="flex">
          <Image
            src={`https://api.iconify.design/skill-icons:${type.toLowerCase()}-dark.svg?color=%23888888`}
            height={36}
            width={36}
            alt={type.toLowerCase()}
            className="mr-4"
            unoptimized
          />
          <GenericRow className="w-[50px] md:w-[100px]">
            <GenericRowTitle>{type}</GenericRowTitle>
            <GenericRowValue className="font-semibold leading-none tracking-tight">
              {props.name}
            </GenericRowValue>
          </GenericRow>
        </div>
        <GenericRow priority={2}>
          <DateRow createdAt={props.createdAt} updatedAt={props.updatedAt} />
        </GenericRow>
        <GenericRow>
          <GenericRowTitle>Size</GenericRowTitle>
          <GenericRowValue>
            {
              MACHINE_SIZES[
                (props.provider as keyof typeof MACHINE_SIZES) ?? "aws"
              ].find((size) => size.value === props.size)?.name
            }
          </GenericRowValue>
        </GenericRow>
        <GenericRow priority={2}>
          <RegionRow region={props.region} />
        </GenericRow>
        <GenericRow priority={1}>
          <ProviderRow provider={props.provider} />
        </GenericRow>
        <div className="flex justify-end gap-6">
          <StatusRow status={props.status} />
          <div className="rotate-90">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setUpdateOpen(true, { id: props.id })}
                  className="cursor-pointer"
                >
                  Upgrade Database
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setConnectOpen(true, { id: props.id })}
                  className="cursor-pointer"
                >
                  Copy Database URL
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DefaultActions
                  mutateKey="database"
                  stackId={props.id}
                  serviceName="database"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}

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
import InstancePortsView from "@/components/Services/Instance/Ports";
import { typeToType } from "@/components/Services/Util";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useModal } from "@/stores/modal";
import { InitialStackInformation } from "@/types/stack";

import { MACHINE_SIZES } from "./Create";

interface StackProps extends InitialStackInformation {
  type: string;
  size: string;
}

export default function InstanceStack(props: StackProps) {
  const [, setConnectOpen] = useModal("connect", "instance");
  const [, setUpdateOpen] = useModal("update", "instance");
  const [openSheet, setOpenSheet] = useModal("sheet", "instance" + props.id);
  const type = typeToType(props.type);

  return (
    <div>
      <Card className="max-w-5xl cursor-pointer shadow-sm">
        <div className="grid grid-flow-col items-center justify-between gap-8 p-6">
          <div className="flex">
            <Image
              src={`https://api.iconify.design/logos:${type.toLowerCase()}.svg?color=%23888888`}
              height={36}
              width={36}
              alt={type.toLowerCase()}
              className="mr-4 h-[36px] w-[36px]"
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
                  <DropdownMenuItem onClick={() => setOpenSheet(true)}>
                    View Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setUpdateOpen(true, { id: props.id })}
                  >
                    Upgrade Instance
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      setConnectOpen(true, {
                        id: props.id,
                        provider: props.provider,
                      })
                    }
                  >
                    Connect to Instance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DefaultActions
                    mutateKey="instance"
                    stackId={props.id}
                    serviceName="instance"
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="!w-full !max-w-2xl rounded-xl">
          <SheetHeader>
            <SheetTitle>{props.name}</SheetTitle>
          </SheetHeader>
          <InstancePortsView id={props.id} provider={props.provider ?? "aws"} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

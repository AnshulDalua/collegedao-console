import { match } from "ts-pattern";
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
import { storageToStorage } from "@/components/Services/Util";
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

interface StackProps extends InitialStackInformation {}

export default function InstanceStack(props: StackProps) {
  const [, setUpdateOpen] = useModal("update", "storage");
  const [, setConnectOpen] = useModal("connect", "storage");

  return (
    <Card className="max-w-5xl shadow-sm">
      <div className="grid grid-flow-col items-center justify-between gap-8 p-6">
        <div className="flex">
          <Image
            src={`https://api.iconify.design/logos:${storageToStorage(
              props.provider
            )}.svg?color=%23888888`}
            height={36}
            width={36}
            alt={props.provider ?? ""}
            className="mr-4 h-[36px] w-[36px] rounded-lg"
            unoptimized
          />
          <GenericRow className="w-[50px] md:w-[100px]">
            <GenericRowTitle>
              {match(props.provider)
                .with("aws", () => `S3`)
                .with("gcp", () => `Cloud Storage`)
                .otherwise(() => "")}
            </GenericRowTitle>
            <GenericRowValue className="font-semibold leading-none tracking-tight">
              {props.name}
            </GenericRowValue>
          </GenericRow>
        </div>
        <GenericRow priority={2}>
          <DateRow createdAt={props.createdAt} updatedAt={props.updatedAt} />
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
                  className="cursor-pointer"
                  disabled={props.provider === "gcp"}
                  onClick={() =>
                    setConnectOpen(true, {
                      id: props.id,
                      provider: props.provider,
                    })
                  }
                >
                  Upload File to Storage
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setUpdateOpen(true, { id: props.id })}
                >
                  Upgrade Storage
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DefaultActions
                  mutateKey="storage"
                  stackId={props.id}
                  serviceName="storage"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}

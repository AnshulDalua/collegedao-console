import { match, P } from "ts-pattern";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWRC } from "@/hooks/useWRC";
import { useModal } from "@/stores/modal";
import { getRelativeTimeDifference } from "@/utils/date";

import { LoadingFill } from "../Loading";

import type { ResponseData as StackError } from "@/pages/api/stack/error";

export default function ErrorModal() {
  const [open, setOpen, data] = useModal("error");
  const { data: errors } = useWRC<StackError>(
    "/api/stack/error",
    (chain) => chain.query({ stackId: data.id }),
    { key: "error" + data.id }
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full  sm:max-w-lg">
        <SheetHeader>
          {match(errors)
            .with(undefined, () => <LoadingFill />)
            .when(
              (e) => e.length === 0,
              () => <SheetTitle>No errors found.</SheetTitle>
            )
            .with(P.array(P._), (errors) => (
              <ScrollArea>
                <SheetTitle>Errors</SheetTitle>
                <div className="h-full max-h-screen">
                  {errors &&
                    errors.map((error, index) => (
                      <div className="my-2 flex flex-col" key={index}>
                        <span className="text-sm text-muted-foreground">
                          <span className="text-sm font-semibold underline">
                            {match(error.o)
                              .with(0, () => "CREATING")
                              .with(1, () => "UPDATING")
                              .with(2, () => "DELETING")
                              .with(3, () => "REFRESHING")
                              .otherwise(() => "UNKNOWN")}
                          </span>{" "}
                          {new Date(error.t).toLocaleString()} aka{" "}
                          {getRelativeTimeDifference(error.t as any)}
                        </span>
                        <p className="max-w-md overflow-hidden text-ellipsis">
                          {error.m}
                        </p>
                        <div className="mt-2 h-[1px] w-full bg-stone-200/30 dark:bg-stone-700/30" />
                      </div>
                    ))}
                  <div className="h-20" />
                </div>
              </ScrollArea>
            ))
            .otherwise(() => null)}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

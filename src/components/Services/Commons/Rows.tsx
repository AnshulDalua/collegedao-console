import { match } from "ts-pattern";

import { LoadingSmall } from "@/components/Loading";
import {
  GenericRowTitle,
  GenericRowValue,
} from "@/components/Services/Generics";
import {
  providerToLongName,
  replaceWithRegionName,
  tagColor,
} from "@/components/Services/Util";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/utils/cn";
import { getRelativeTimeDifference } from "@/utils/date";

/**
 * @StatusComponent
 * @description Shows the status of the service in a tag
 */

interface StatusProps extends React.HTMLAttributes<HTMLDivElement> {
  status: string;
}

export function StatusRow(props: StatusProps) {
  return (
    <div {...props} className={cn("flex items-center", props.className)}>
      <span
        className={cn(
          tagColor(props.status),
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
        )}
      >
        {match(props.status)
          .with("PENDING", "UPDATING", () => (
            <LoadingSmall className="-ml-1 mb-[0.8px] mr-[6px] h-3 w-3 animate-spin" />
          ))
          .otherwise(() => null)}
        {props.status}
      </span>
    </div>
  );
}

/**
 * @DateComponent
 * @description Shows the createdAt date of the service with a hover card for the updatedAt date
 */

interface DateProps {
  createdAt: string;
  updatedAt: string;
}

export function DateRow(props: DateProps) {
  return (
    <>
      <GenericRowTitle>Updated At</GenericRowTitle>
      <GenericRowValue className="cursor-pointer">
        <HoverCard openDelay={100} closeDelay={200}>
          <HoverCardTrigger asChild>
            <p className="text-primary underline-offset-4 hover:underline ">
              {getRelativeTimeDifference(props.updatedAt)}
            </p>
          </HoverCardTrigger>
          <HoverCardContent className="w-30" side="top">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <p className="flex flex-col text-sm">
                  <span className="font-semibold">Created At:</span>{" "}
                  {new Date(props.createdAt).toLocaleString()}
                </p>
                <p className="flex flex-col text-sm">
                  <span className="font-semibold">Update At:</span>{" "}
                  {new Date(props.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </GenericRowValue>
    </>
  );
}

/**
 * @RegionComponent
 * @description Shows the region of the service
 */

interface RegionProps {
  region?: string;
}

export function RegionRow(props: RegionProps) {
  return (
    <>
      <GenericRowTitle>Region</GenericRowTitle>
      <GenericRowValue>{replaceWithRegionName(props.region)}</GenericRowValue>
    </>
  );
}

/**
 * @ProviderComponent
 * @description Shows the provider of the service
 */

interface ProviderProps {
  provider?: string;
}

export function ProviderRow(props: ProviderProps) {
  return (
    <>
      <GenericRowTitle>Provider</GenericRowTitle>
      <GenericRowValue>
        {providerToLongName(props.provider ?? "aws")}
      </GenericRowValue>
    </>
  );
}

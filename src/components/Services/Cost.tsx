import { match, P } from "ts-pattern";

import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import type { Cost } from "@/utils/infracost";

interface CostSnippetProps {
  cost: Cost | null;
  loading: boolean;
}

export default function CostSnippet(props: CostSnippetProps) {
  return match([props.cost, props.loading])
    .with([null, P.any], () => (
      <Card className="mt-2 flex flex-col p-4 ">
        <div className="flex h-[40px] items-center">
          <p className="animate-pulse	align-middle">Loading cost...</p>
        </div>
      </Card>
    ))
    .with([P.not(null), false], ([cost]) => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="mt-2 flex cursor-pointer flex-col p-4">
            {cost.totalMonthlyCost === "0.00" ? (
              <span className="text-sm font-medium">
                Pricing depends on usage
              </span>
            ) : (
              <span className="underline ">
                ${cost.totalMonthlyCost} / month
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Hover for more info
            </span>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-fit" side="top">
          <div className="flex flex-row justify-between gap-2 pb-2 font-bold">
            <p>What</p>
            <p>Cost</p>
          </div>
          <div className="flex flex-col gap-2">
            {cost.costComponents.map((comp, index) => (
              <div key={index} className="flex flex-row justify-between gap-8">
                <p className="max-w-xs">{comp.name}</p>
                {comp.monthlyCost ? (
                  <p>
                    {comp.monthlyQuantity && `${comp.monthlyQuantity} * `}$
                    {comp.unitPrice} / {comp.unit}
                  </p>
                ) : (
                  <p>
                    ${comp.unitPrice} / {comp.unit} per month
                  </p>
                )}
              </div>
            ))}
            <div className="my-2 border-b border-gray-200" />
            <div className="flex flex-row justify-between gap-2 font-bold">
              <p>Total</p>
              <p>${cost.totalMonthlyCost} / month</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    ))
    .otherwise(() => null);
}

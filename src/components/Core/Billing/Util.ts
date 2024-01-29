import set from "lodash/set";

import type { ResponseData as GetCost } from "@/pages/api/project/billing/aws";

export interface AWSBillingOrganized {
  thisMonth: {
    [key: string]: number;
  };
  thisMonthTotal: number;
  lastMonthTotal: number;
  lastTwelveMonths: {
    [key: string]: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export const sanitizeName = (name: string) =>
  name.replaceAll("Amazon ", "").split(" -")[0] ?? "Unknown";
const parseFloaty = (value?: string): number =>
  +parseFloat(value ?? "0.0").toFixed(2);

export function OrganizeAWSBilling(obj: GetCost): AWSBillingOrganized {
  const thisMonth = {};
  let lastMonthTotal = 0.0;
  const lastTwelveMonths = {};
  const thisMonthData = obj.ResultsByTime?.at(-1) ?? {};

  if (thisMonthData) {
    for (const group of thisMonthData?.Groups ?? []) {
      const key = group.Keys?.[0];
      const amount = group.Metrics?.UnblendedCost?.Amount;
      if (key && amount) {
        set(thisMonth, sanitizeName(key) ?? "", parseFloaty(amount));
      }
    }
  }

  for (const month of obj.ResultsByTime ?? []) {
    let cost = 0.0;
    if (month.Total && Object.keys(month.Total).length > 0) {
      const date = new Date(
        month.TimePeriod?.Start ?? new Date()
      ).toLocaleString("default", { month: "short", year: "2-digit" });
      cost = parseFloaty(month.Total.UnblendedCost?.Amount);
      set(lastTwelveMonths, date, cost);
    } else {
      for (const group of month.Groups ?? []) {
        cost += parseFloaty(group.Metrics?.UnblendedCost?.Amount ?? "0.0");
      }
      const date = new Date(
        month.TimePeriod?.Start ?? new Date()
      ).toLocaleString("default", { month: "short", year: "2-digit" });
      set(lastTwelveMonths, date, cost);
    }

    // Check if the month is the second to last month
    if (
      month.TimePeriod?.Start === obj.ResultsByTime?.at(-2)?.TimePeriod?.Start
    ) {
      lastMonthTotal = +cost.toFixed(2);
    }
  }

  const thisMonthTotal = +(
    Object.values(thisMonth).reduce((a: any, b: any) => a + b, 0) as number
  ).toFixed(2);

  return {
    thisMonth,
    thisMonthTotal,
    lastTwelveMonths,
    lastMonthTotal,
    dateRange: {
      start: obj.ResultsByTime?.[0]?.TimePeriod?.Start ?? "",
      end: obj.ResultsByTime?.at(-1)?.TimePeriod?.End ?? "",
    },
  };
}

export function getDifference(a: number, b: number) {
  return (
    (a < b
      ? "-" + (Math.round((b - a) * 100) / a).toFixed(2)
      : "+" + (Math.round((a - b) * 100) / b).toFixed(2)) + "%"
  );
}

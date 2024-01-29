import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import type { AWSBillingOrganized } from "./Util";

ChartJS.register(LinearScale, CategoryScale, BarElement, Tooltip);

interface AWSBillingTypeProps {
  info: AWSBillingOrganized;
}

export function ThisMonthBar(props: AWSBillingTypeProps) {
  return (
    <Bar
      className="pt-6"
      data={{
        labels: Object.keys(props.info.thisMonth),
        datasets: [
          {
            label: "Cost",
            data: Object.values(props.info.thisMonth),
            backgroundColor: ["#f7744469"],
            borderColor: ["#f76544ba"],
            borderWidth: 2,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  );
}

export function LastTwelveMonthsBar(props: AWSBillingTypeProps) {
  return (
    <Bar
      className="pt-6"
      data={{
        labels: Object.keys(props.info.lastTwelveMonths),
        datasets: [
          {
            label: "Cost",
            data: Object.values(props.info.lastTwelveMonths),
            backgroundColor: ["#f7744469"],
            borderColor: ["#f76544ba"],
            borderWidth: 2,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  );
}

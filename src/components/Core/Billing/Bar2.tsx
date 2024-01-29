// import {
//   Bar,
//   BarChart,
//   Legend,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
// } from "recharts";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface CardStatsProps {
//   twelvemonths: {
//     name: string;
//     cost: number | string;
//   }[];
//   services: {
//     name: string;
//     cost: number | string;
//   }[];
// }

// export default function CardsStats(props: CardStatsProps) {
//   return (
//     <div className="grid grid-cols-1 grid-rows-2 gap-4 xl:grid-cols-2 xl:grid-rows-1">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-lg font-bold">
//             This Month Overview
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="max-w-xs text-sm text-muted-foreground">
//             Overview of this month cloud spend
//           </p>
//           <div className="mt-4 h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={props.services}>
//                 <Bar dataKey="cost" fill="#f76544ba" />
//                 <Tooltip
//                   content={({ active, payload }) => {
//                     if (active && payload && payload.length) {
//                       return (
//                         <div className="w-sm rounded-lg border bg-background p-2 shadow-sm">
//                           <div className="grid grid-cols-2 gap-2">
//                             <div className="flex flex-col">
//                               <span className="text-[10px] uppercase text-muted-foreground">
//                                 {payload[0]?.payload.name}
//                               </span>
//                               <span className="font-bold text-muted-foreground">
//                                 $
//                                 {new Intl.NumberFormat("en-US").format(
//                                   payload[0]?.value as number
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     }

//                     return null;
//                   }}
//                 />
//                 <Legend />
//                 <XAxis dataKey="name" className="text-xs" allowDataOverflow />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-lg font-bold">
//             Last Twelve Months
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="max-w-xs text-sm text-muted-foreground">
//             Total cloud spend for the last twelve months. Hover over the line to
//             get more details.
//           </p>
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart
//                 data={props.twelvemonths}
//                 margin={{
//                   top: 5,
//                   right: 10,
//                   left: 10,
//                   bottom: 0,
//                 }}
//               >
//                 <Line
//                   type="monotone"
//                   strokeWidth={2}
//                   dataKey="cost"
//                   activeDot={{
//                     r: 6,
//                     style: { fill: "#f76544ba", opacity: 0.25 },
//                   }}
//                   style={{
//                     stroke: "#f76544ba",
//                   }}
//                 />
//                 <Tooltip
//                   content={({ active, payload }) => {
//                     if (active && payload && payload.length) {
//                       return (
//                         <div className="rounded-lg border bg-background p-2 shadow-sm">
//                           <div className="grid grid-cols-2 gap-2">
//                             <div className="flex flex-col">
//                               <span className="text-[0.70rem] uppercase text-muted-foreground">
//                                 {payload[0]?.payload.name}
//                               </span>
//                               <span className="font-bold text-muted-foreground">
//                                 $
//                                 {new Intl.NumberFormat("en-US").format(
//                                   payload[0]?.value as number
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     }

//                     return null;
//                   }}
//                 />
//                 <XAxis dataKey="name" className="text-xs" />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
export default function Bar2() {
  return <></>;
}

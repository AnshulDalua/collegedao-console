import { match, P } from "ts-pattern";

import { AWS_REGIONS, GCP_REGIONS } from "@/components/Services/CommonInputs";

const SHIMMER =
  " relative isolate overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-slate-100/20 before:bg-gradient-to-r before:from-transparent before:via-slate-100/20 before:to-transparent";

export function tagColor(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-green-100 text-green-800 border-green-800/10 dark:bg-green-800 dark:text-green-100 dark:border-green-100/10";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-800/10 dark:bg-red-800 dark:text-red-100 dark:border-red-100/10";
    case "PENDING":
      return (
        "bg-yellow-100 text-yellow-800 border-yellow-800/10 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-100/10" +
        SHIMMER
      );
    case "QUEUED":
      return (
        "bg-blue-100 text-blue-800 border-blue-800/10 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-100/10" +
        SHIMMER
      );
    case "UPDATING":
      return (
        "bg-purple-100 text-purple-800 border-purple-800/10 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-100/10" +
        SHIMMER
      );
    default:
      return "bg-gray-200 text-gray-800 border-gray-800/10 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-100/10";
  }
}

export function providerToLongName(provider: string | undefined) {
  return match(provider)
    .with(P.string.includes("aws"), () => "Amazon Web Services")
    .with(P.string.includes("gcp"), () => "Google Cloud Platform")
    .with(P.string.includes("cf"), () => "Cloudflare")
    .with(P.string.includes("do"), () => "Digital Ocean")
    .with(P.string.includes("azure"), () => "Microsoft Azure")
    .otherwise(() => provider ?? "Unknown");
}

export function replaceWithRegionName(str: string | undefined) {
  return (
    AWS_REGIONS.find((region) => region.value === str)?.name ??
    GCP_REGIONS.find((region) => region.value === str)?.name ??
    str?.replaceAll("-", "_").toLocaleLowerCase() ??
    "Unknown"
  )?.replace(/\(.*\)/, "");
}

export function engineToEngine(engine: string | undefined) {
  return match(engine?.toLocaleLowerCase())
    .with(P.string.includes("postgres"), () => "PostgreSQL")
    .with(P.string.includes("mysql"), () => "MySQL")
    .otherwise(() => engine ?? "Unknown");
}

export function typeToType(engine: string | undefined) {
  return match(engine?.toLocaleLowerCase())
    .with(P.string.includes("ubuntu"), () => "Ubuntu")
    .with(P.string.includes("centos"), () => "CentOS")
    .with(P.string.includes("debian"), () => "Debian")
    .otherwise(() => engine ?? "Unknown");
}

export function storageToStorage(provider: string | undefined) {
  return match(provider)
    .with("aws", () => `aws-s3`)
    .with("gcp", () => `google-cloud-platform`)
    .otherwise(() => "Unknown");
}

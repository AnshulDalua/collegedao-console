import {
  adjectives,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import Image from "next/image";

import { Label } from "@/components/ui/label";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountStore } from "@/stores/account";
import { cn } from "@/utils/cn";

import { GenericInput, GenericSelect } from "./Generics";

export const AWS_REGIONS = [
  { divide: "United States" },
  { name: "US West (Oregon)", value: "us-west-2", description: "Default" },
  { name: "US East (Ohio)", value: "us-east-2" },
  { name: "US East (N. Virginia)", value: "us-east-1" },
  { name: "US West (N. California)", value: "us-west-1" },
  { divide: "Europe" },
  { name: "Europe (Frankfurt)", value: "eu-central-1" },
  { name: "Europe (Ireland)", value: "eu-west-1" },
  { name: "Europe (London)", value: "eu-west-2" },
  { name: "Europe (Milan)", value: "eu-south-1" },
  { name: "Europe (Paris)", value: "eu-west-3" },
  { name: "Europe (Spain)", value: "eu-south-2" },
  { name: "Europe (Stockholm)", value: "eu-north-1" },
  { name: "Europe (Zurich)", value: "eu-central-2" },
  { divide: "Africa" },
  { name: "Africa (Cape Town)", value: "af-south-1" },
  { divide: "Asia" },
  { name: "Asia (Hong Kong)", value: "ap-east-1" },
  { name: "Asia (Hyderabad)", value: "ap-south-2" },
  { name: "Asia (Jakarta)", value: "ap-southeast-3" },
  { name: "Asia (Melbourne)", value: "ap-southeast-4" },
  { name: "Asia (Mumbai)", value: "ap-south-1" },
  { name: "Asia (Osaka)", value: "ap-northeast-3" },
  { name: "Asia (Seoul)", value: "ap-northeast-2" },
  { name: "Asia (Singapore)", value: "ap-southeast-1" },
  { name: "Asia (Sydney)", value: "ap-southeast-2" },
  { name: "Asia (Tokyo)", value: "ap-northeast-1" },
  { divide: "Canda" },
  { name: "Canada (Central)", value: "ca-central-1" },
  // { divide: "Middle East" },
  // { name: "Middle East (Bahrain)", value: "me-south-1" },
  // { name: "Middle East (UAE)", value: "me-central-1" },
  { divide: "South America" },
  { name: "South America (São Paulo)", value: "sa-east-1" },
];

export function AWSRegionComboxBox() {
  return (
    <GenericSelect name="region::enviromentConfig.region" data={AWS_REGIONS} />
  );
}

export const GCP_REGIONS = [
  {
    name: "US Central",
    description: "Council Bluffs, Iowa, USA",
    value: "us-central1",
  },
  {
    name: "US East",
    description: "Moncks Corner, South Carolina, USA",
    value: "us-east1",
  },
  {
    name: "US East",
    description: "Ashburn, Northern Virginia, USA",
    value: "us-east4",
  },
  {
    name: "US East",
    description: "Columbus, Ohio, North America, USA",
    value: "us-east5",
  },
  { name: "US South", description: "Dallas, Texas, USA", value: "us-south1" },
  {
    name: "US West",
    description: "The Dalles, Oregon, USA",
    value: "us-west1",
  },
  {
    name: "US West",
    description: "Los Angeles, California, USA",
    value: "us-west2",
  },
  {
    name: "US West",
    description: "Salt Lake City, Utah, USA",
    value: "us-west3",
  },
  { name: "US West", description: "Las Vegas, Nevada, USA", value: "us-west4" },
  {
    name: "EU Central",
    description: "Warsaw, Poland",
    value: "europe-central2",
  },
  { name: "EU", description: "Hamina Finland", value: "europe-north1" },
  { name: "EU", description: "Madrid Spain", value: "europe-southwest1" },
  {
    name: "EU West",
    description: "St. Ghislain, Belgium",
    value: "europe-west1",
  },
  {
    name: "EU West",
    description: "London, England, UK",
    value: "europe-west2",
  },
  { name: "EU West", description: "Frankfurt, Germany", value: "europe-west3" },
  {
    name: "EU West",
    description: "Eemshaven, Netherlands",
    value: "europe-west4",
  },
  {
    name: "EU West",
    description: "Zurish, Switzerland",
    value: "europe-west6",
  },
  { name: "EU West", description: "Milan, Italy", value: "europe-west8" },
  { name: "EU West", description: "Paris, France", value: "europe-west9" },
  { name: "EU West", description: "Turin, Italy", value: "europe-west12" },
  {
    name: "Asia Pacific",
    description: "Changhua County, Taiwan",
    value: "asia-east1",
  },
  { name: "Asia Pacific", description: "Hong Kong", value: "asia-east2" },
  {
    name: "Asia Pacific",
    description: "Tokyo, Japan",
    value: "asia-northeast1",
  },
  {
    name: "Asia Pacific",
    description: "Osaka, Japan",
    value: "asia-northeast2",
  },
  {
    name: "Asia Pacific",
    description: "Seoul, South Korea",
    value: "asia-northeast3",
  },
  { name: "Asia Pacific", description: "Mumbai, India", value: "asia-south1" },
  { name: "Asia Pacific", description: "Delhi, India", value: "asia-south2" },
  {
    name: "Asia Pacific",
    description: "Jurong West, Singapore",
    value: "asia-southeast1",
  },
  {
    name: "Asia Pacific",
    description: "Jakarta, Indonesia",
    value: "asia-southeast2",
  },
  {
    name: "Asia Pacific",
    description: "Sydney, Australia",
    value: "australia-southeast1",
  },
  {
    name: "Asia Pacific",
    description: "Melbourne, Australia",
    value: "australia-southeast2",
  },
  { name: "Middle East", description: "Doha, Qatar", value: "me-central1" },
  { name: "Middle East", description: "Tel Aviv, Israel", value: "me-west1" },
  {
    name: "North America",
    description: "Montréal, Québec, Canada",
    value: "northamerica-northeast1",
  },
  {
    name: "North America",
    description: "Toronto, Ontario, Canada",
    value: "northamerica-northeast2",
  },
  {
    name: "South America",
    description: "São Paulo, Brazil",
    value: "southamerica-east1",
  },
  {
    name: "South America",
    description: "Santiago, Chile",
    value: "southamerica-east2",
  },
];

export function GCPRegionComboxBox() {
  return (
    <GenericSelect name="region::enviromentConfig.region" data={GCP_REGIONS} />
  );
}

export function ProviderTabList(props: any) {
  const credentials = useAccountStore(
    (state) => state.currentProject?.credentials?.contents
  ) as {
    [key: string]: boolean;
  } | null;

  return (
    <TabsList className="mb-4 w-full">
      <TabsTrigger
        className="flex w-full items-center"
        value="aws"
        data-value="aws"
        name="provider::provider"
        type="button"
        disabled={!props.noDisabled && !credentials?.aws}
      >
        <Image
          src="https://api.iconify.design/skill-icons:aws-dark.svg?color=%23888888"
          alt={"AWS"}
          width={8}
          height={8}
          className="mr-2 h-5 w-5"
          loading="lazy"
          unoptimized
        />
        Amazon Web Services
      </TabsTrigger>
      <TabsTrigger
        className="w-full"
        value="gcp"
        data-value="gcp"
        name="provider::provider"
        type="button"
        disabled={!props.noDisabled && !credentials?.gcp}
      >
        <Image
          src="https://api.iconify.design/skill-icons:gcp-dark.svg?color=%23888888"
          alt={"GCP"}
          width={8}
          height={8}
          className="mr-2 h-5 w-5"
          loading="lazy"
          unoptimized
        />
        Google Cloud
      </TabsTrigger>
    </TabsList>
  );
}

export function NameInput(props: React.HTMLAttributes<HTMLDivElement>) {
  const defaultName =
    props.defaultValue ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors],
      length: 1,
      separator: "-",
    });
  return (
    <div className={cn("flex flex-col gap-2 pb-[1.25rem]", props.className)}>
      <Label className="ml-0.5">Name</Label>
      <GenericInput
        name="name::name"
        label="Name"
        type="text"
        placeholder="Name of the service"
        autoComplete="off"
        required
        defaultValue={defaultName}
      />
    </div>
  );
}

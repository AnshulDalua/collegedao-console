import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NoCredentials(text: string, id: string | number) {
  return (
    <div
      className="flex cursor-pointer flex-row items-center justify-between
    gap-4 border-dashed bg-light-primary p-4 shadow-sm dark:border-dark-stroke dark:bg-dark-tertiary"
      onClick={() => {
        toast.dismiss(id);
      }}
    >
      <p>{text}</p>
      <Link
        href="/app/credentials"
        onClick={() => {
          toast.dismiss(id);
        }}
      >
        <Button className="min-w-[140px] p-2">Add Credentials</Button>
      </Link>
    </div>
  );
}

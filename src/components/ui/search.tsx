import React from "react";

import { Input } from "@/components/ui/input";

export function Search(props: React.ComponentPropsWithoutRef<"input">) {
  return (
    <div>
      <Input type="search" placeholder="Search..." {...props} />
    </div>
  );
}

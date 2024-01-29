import { useEffect } from "react";

import { mutateKey } from "@/hooks/useMutate";
import { useRealtime } from "@/stores/realtime";

export function MutateRealtime() {
  const socket$ = useRealtime((state) => state.socket$);

  useEffect(() => {
    const subscription = socket$.subscribe(({ data }) => {
      if (Array.isArray(data)) {
        for (const key of data) {
          if (key?.includes(":")) {
            const [_, tempKey] = key.split("::");
            mutateKey(tempKey);
          } else {
            mutateKey(key);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [socket$]);

  return null;
}

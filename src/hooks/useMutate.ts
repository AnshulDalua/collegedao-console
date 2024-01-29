import { mutate } from "swr";

import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";

export const useMutate = (key: string) => {
  const token = useAuthStore((state) => state.token);
  const currentProject = useAccountStore((state) => state.currentProject);

  return () => mutate([key, currentProject?.id, token]);
};

export const mutateKey = (key: string) => {
  return mutate([
    key,
    useAccountStore.getState().currentProject?.id,
    useAuthStore.getState().token,
  ]);
};

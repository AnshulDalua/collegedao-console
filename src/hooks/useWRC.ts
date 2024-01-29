import useSWR from "swr";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import { useRouter } from "next/router";

import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";

import type { Wretch, WretchResponseChain } from "wretch";
import type { QueryStringAddon as TypeQueryStringAddon } from "wretch/addons/queryString";

/* Essentially a wrapper around wretch that adds the current team and token to the request. */
/* This uses useSWR to cache the response and to add more functionality like loading/error */
/* Refer to https://swr.vercel.app/ for more information. */
/* wretch is a small wrapper around fetch designed to simplify the way to perform network requests and handle responses. */

type Chain = TypeQueryStringAddon &
  Wretch<
    TypeQueryStringAddon,
    unknown,
    WretchResponseChain<TypeQueryStringAddon, unknown, undefined>
  >;

type Args = {
  key?: string | string[];
  swr?: {
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    refreshWhenOffline?: boolean;
    refreshWhenHidden?: boolean;
    refreshInterval?: number;
    shouldRetryOnError?: boolean;
  };
};

export const useWRC = <T>(
  url: string,
  chain: (chain: Chain) => Chain,
  args?: Args
) => {
  const token = useAuthStore((state) => state.token);
  const currentProject = useAccountStore((state) => state.currentProject);
  const teamId = useAccountStore((state) => state.teamId);
  const router = useRouter();

  const { data, error, mutate, isLoading } = useSWR<T>(
    [
      Array.isArray(args?.key) ? args?.key.join("-") : args?.key,
      currentProject?.id,
      token,
    ],
    () =>
      chain(
        wretch(url)
          .addon(QueryStringAddon)
          .auth(`Bearer ${token}`)
          .content("application/json")
          .accept("application/json")
          .query({ projectId: currentProject?.id, teamId: teamId })
          .resolve((_) => _.unauthorized(() => router.push("/login")))
      )
        .get()
        .json()
        .then((d: any) => {
          if (!d.ok) throw new Error(d.error);
          else return d.data;
        }),
    args?.swr ?? {}
  );
  return {
    data,
    error,
    mutate,
    loading: isLoading,
  };
};

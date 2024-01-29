import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";

import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";

/* Essentially a wrapper around wretch that adds the current team and token to the request. */
/* wretch is a small wrapper around fetch designed to simplify the way to perform network requests and handle responses. */

export const wretchClient = () =>
  wretch("")
    .addon(QueryStringAddon)
    .auth(`Bearer ${useAuthStore.getState().token}`)
    .content("application/json")
    .accept("application/json")
    .query({
      projectId: useAccountStore.getState().currentProject?.id,
      teamId: useAccountStore.getState().teamId,
    })
    .resolve((_) => _.unauthorized(() => useAuthStore.getState().off()))
    // We do this because we want to handle errors instead of letting wretch handle them
    .resolve((_) => _.badRequest((err) => err.json));

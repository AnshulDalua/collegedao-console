import wretch from "wretch";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAccountStore } from "./account";

import type { Response as UserResponse } from "@/pages/api/user";

export interface AuthStore {
  token: string | null;
  status: "on" | "off";
  currentProjectId: string | null;
  on: (token: string) => void;
  off: () => void;
  setUserandToken: (token: string) => void;
  setCurrentProjectId: (projectId: string) => void;
  grabUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      status: "off",
      currentProjectId: null,
      on: (token) => set({ token: token, status: "on" }),
      off: () => set({ status: "off", token: null }),
      setUserandToken: (token) => {
        set({ token: token, status: "on" });
        get().grabUserData();
      },
      setCurrentProjectId: (projectId) => set({ currentProjectId: projectId }),
      grabUserData: async () => {
        const response = await wretch("/api/user")
          .auth(`Bearer ${get().token}`)
          .get()
          .badRequest((err) => err.json)
          .unauthorized((err) => err.json)
          .json<UserResponse>();

        if (!response.ok || !response.data) get().off();
        else useAccountStore.getState().setUser(response.data);
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({
        token: state.token,
        status: state.status,
        currentProjectId: state.currentProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.status === "on") {
          state?.grabUserData();
        } else {
          state?.off();
        }
      },
    }
  )
);

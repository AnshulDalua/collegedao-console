import { Subject } from "rxjs";
import { io } from "socket.io-client";
import { create } from "zustand";

import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";
import { env } from "@/env.mjs";

import type { Socket } from "socket.io-client";

type RealtimeSubject = Subject<{
  category: string;
  data: any;
}>;

interface RealtimeStore {
  socket$: RealtimeSubject;
  socket: Socket | null;
  init: (token: string, projectId: string) => void;
  getSocket$: () => RealtimeSubject;
  disconnect: () => void;
}

export const useRealtime = create<RealtimeStore>((set, get) => ({
  socket$: new Subject(),
  socket: null,
  getSocket$: () => {
    /* Socket Subject may not be connected to the Socket in the case when token and projectId are null  */
    if (!get().socket$) {
      const token = useAuthStore.getState().token;
      const projectId = useAccountStore.getState().currentProject?.id;
      if (token && projectId) get().init(token, projectId);
    }
    return get().socket$!;
  },
  init: (token: string, projectId: string) => {
    if (get().socket) get().socket?.disconnect();

    const socket = io(env.NEXT_PUBLIC_REALTIME_URL, {
      auth: {
        token: token,
        projectId: projectId,
      },
      transports: ["websocket"],
    });

    socket.onAny((category, data) => {
      get().socket$.next({ category, data });
    });

    // Every 10 minutes proadcats a ping event to keep the connection alive
    setInterval(() => {
      get().socket$?.next({ category: "ping", data: null });
    }, 0.2 * 60 * 1000);

    set({ socket });
  },
  disconnect: () => get().socket?.disconnect(),
}));

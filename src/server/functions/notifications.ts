import { inngest } from "@/server/inngest";
import Data from "@/server/util/data";
import { emit } from "@/server/util/emit";
import { notification } from "@/types/notifications";

import type { Notifications } from "@/types/notifications";

export const addNotification = inngest.createFunction(
  { id: "send-notifications", name: "Notification" },
  { event: "console/notifications" },
  async ({ event, step }) => {
    await step.run("Add Notification", async () => {
      const data = new Data<Notifications>(
        "notifications",
        event.data.projectId
      );

      event.data.notification.t = new Date(event.data.notification.t);

      const noti = notification.safeParse(event.data.notification);

      if (!noti.success) {
        return console.error(noti.error);
      }

      const info = await data.update((value) =>
        value ? [noti.data, ...value] : [noti.data]
      );

      await emit(event.data.projectId, ["notifications", event.data.key]);

      return { ok: true, data: info };
    });
  }
);

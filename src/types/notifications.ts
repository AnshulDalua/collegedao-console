import { z } from "zod";

export const notification = z.object({
  i: z.number().optional(), // Id (optional for migration)
  t: z.date(), // Timestamp
  m: z.string(), // Message
  s: z.enum(["loading", "info", "warn", "error"]), // Status
  v: z.boolean(), // Viewed
});
export const notifications = z.array(notification);

export type Notifications = z.infer<typeof notifications>;
export type Notification = z.infer<typeof notification>;

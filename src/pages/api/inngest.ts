import { serve } from "inngest/next";

import { awsSetup } from "@/pages/api/project/billing/aws/setup";
import { addNotification } from "@/server/functions/notifications";
import { inngest } from "@/server/inngest";

export default serve({
  client: inngest,
  functions: [awsSetup, addNotification],
});

import { useRouter } from "next/router";

import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  if (typeof window !== `undefined` && status === "off") {
    router.push("/login");
    return null;
  } else if (typeof window !== `undefined` && status === "on") {
    router.push("/app");
    return null;
  }
}

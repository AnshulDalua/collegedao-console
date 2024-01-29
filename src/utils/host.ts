import { match, P } from "ts-pattern";

import { KnownError } from "@/utils/error";

/** Essentially determines if the host header is coming from the correct place.
 * Add more host names as needed. */

export default function host(host: string) {
  const hosty = () => `https://${host}`;
  return match(host)
    .with(P.string.includes("nisarg-dev-rocetta.vercel.app"), hosty)
    .with(P.string.includes("staging-rocetta.vercel.app"), hosty)
    .with(P.string.includes("rocetta.com"), hosty)
    .with(P.string.includes("localhost"), () => {
      if (process.env.NODE_ENV === "production") {
        throw new KnownError("Host is not correct");
      } else return `http://${host}`;
    })
    .otherwise(() => {
      throw new KnownError("Host is not correct");
    });
}

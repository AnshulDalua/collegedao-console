import { User } from "@prisma/client";
import wretch from "wretch";
import { WretchError } from "wretch/resolver";

import { env } from "@/env.mjs";

export const createLoopsContact = async (user: User) => {
  try {
    const [firstName, lastName] = user.name!.split(" ") ?? ["", ""];
    await wretch("https://app.loops.so/api/v1/contacts/create")
      .auth(`Bearer ${env.LOOPS_KEY}`)
      .json({
        email: user.email,
        firstName,
        lastName,
        userGroup: "Users",
        source: "Signup from Console",
      })
      .post();
  } catch (e) {
    if (e instanceof WretchError) {
      console.log(e.json ?? e.text ?? e.message);
    }
  }
};

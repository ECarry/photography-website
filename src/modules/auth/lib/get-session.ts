import { cache } from "react";
import { auth } from "./auth";
import { headers } from "next/headers";

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export const getActiveSessions = cache(async () => {
  return await auth.api.listSessions({
    headers: await headers(),
  });
});

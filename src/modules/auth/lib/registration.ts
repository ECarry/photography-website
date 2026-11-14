import { count } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { canRegisterFirstUser } from "./registration-policy";

export async function isFirstUserRegistrationAvailable() {
  const result = await db.select({ value: count() }).from(schema.user);
  return canRegisterFirstUser(result[0]?.value ?? 0);
}

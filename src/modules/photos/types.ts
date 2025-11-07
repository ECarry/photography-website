import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type photoGetMany = inferRouterOutputs<
  typeof appRouter
>["photos"]["getMany"]["items"];

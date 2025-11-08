import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type DashboardGetPhotosCountByMonth = inferRouterOutputs<
  typeof appRouter
>["dashboard"]["getPhotosCountByMonth"];

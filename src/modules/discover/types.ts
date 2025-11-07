import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type DiscoverGetManyPhotos = inferRouterOutputs<
  typeof appRouter
>["discover"]["getManyPhotos"];

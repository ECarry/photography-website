import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type postsGetMany = inferRouterOutputs<
  typeof appRouter
>["blog"]["getMany"];

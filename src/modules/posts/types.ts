import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type PostGetOne = inferRouterOutputs<
  typeof appRouter
>["posts"]["getOne"];

export type PostGetMany = inferRouterOutputs<
  typeof appRouter
>["posts"]["getMany"]["items"];

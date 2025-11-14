import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/trpc/routers/_app";

export type TravelGetOne = inferRouterOutputs<
  typeof appRouter
>["travel"]["getOne"];

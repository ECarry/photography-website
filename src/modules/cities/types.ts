import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/trpc/routers/_app";

export type CityGetMany = inferRouterOutputs<
  typeof appRouter
>["city"]["getMany"];

export type CityGetOne = inferRouterOutputs<typeof appRouter>["city"]["getOne"];

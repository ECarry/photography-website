import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type DiscoverGetManyPhotos = inferRouterOutputs<
  typeof appRouter
>["discover"]["getManyPhotos"];

export type DiscoverPhotoPoint = DiscoverGetManyPhotos["photos"][number];

export type DiscoverPhotoDetails = inferRouterOutputs<
  typeof appRouter
>["discover"]["getPhotosByIds"][number];

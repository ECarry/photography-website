import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/trpc/routers/_app";
import type { Photo } from "@/db/schema";

export type TravelGetOne = inferRouterOutputs<
  typeof appRouter
>["travel"]["getOne"];

export type PublicCitySet = {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  coverPhotoId: string;
  coverPhoto: Pick<Photo, "url" | "title" | "blurData">;
};

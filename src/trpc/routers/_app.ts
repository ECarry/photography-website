import { createTRPCRouter } from "../init";
import { photosRouter } from "@/modules/photos/server/procedures";
import { mapRouter } from "@/modules/discover/server/procedures";
import { cloudflareR2Router } from "@/modules/cloudflare/server/procedures";
import { travelRouter } from "@/modules/travel/server/procedures";
import { summaryRouter } from "@/modules/dashboard/server/procedures";
import { postsRouter } from "@/modules/posts/server/procedures";

export const appRouter = createTRPCRouter({
  map: mapRouter,
  photos: photosRouter,
  cloudflare: cloudflareR2Router,
  travel: travelRouter,
  summary: summaryRouter,
  posts: postsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

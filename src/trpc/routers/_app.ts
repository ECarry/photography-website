import { createTRPCRouter } from "../init";
import { postsRouter } from "@/modules/posts/server/procedures";
import { photosRouter } from "@/modules/photos/server/procedures";
import { cityRouter } from "@/modules/cities/server/procedures";
import { cloudflareRouter } from "@/modules/cloudflare/server/procedures";
import { homeRouter } from "@/modules/home/server/procedures";
import { discoverRouter } from "@/modules/discover/server/procedures";
import { travelRouter } from "@/modules/travel/server/procedures";
import { blogRouter } from "@/modules/blog/server/procedures";

export const appRouter = createTRPCRouter({
  posts: postsRouter,
  photos: photosRouter,
  city: cityRouter,
  cloudflare: cloudflareRouter,
  home: homeRouter,
  discover: discoverRouter,
  travel: travelRouter,
  blog: blogRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

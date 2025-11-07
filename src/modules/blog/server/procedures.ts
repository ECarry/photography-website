import { db } from "@/db";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq } from "drizzle-orm";
import { posts } from "@/db/schema";

export const blogRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db
      .select()
      .from(posts)
      .where(eq(posts.visibility, "public"))
      .orderBy(desc(posts.updatedAt))
      .limit(10);

    return data;
  }),
});

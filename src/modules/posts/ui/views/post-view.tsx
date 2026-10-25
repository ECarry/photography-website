"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PostForm } from "../components/post-form";

export const PostView = ({ slug }: { slug: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.posts.getOne.queryOptions({ slug }));
  return (
    <main className="min-h-full bg-[#FAFAFA] px-4 py-6 dark:bg-[#0A0A0A] md:px-6 md:py-8 xl:px-8">
      <PostForm key={data.id} post={data} />
    </main>
  );
};

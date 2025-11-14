import { Metadata } from "next";
import { BlogSlugView } from "@/modules/blog/ui/views/blog-slug-view";
import { getQueryClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.blog.getOne.queryOptions({ slug })
  );

  return {
    title: data.title,
    description: data.description,
  };
}

export default async function page({ params }: Props) {
  const slug = (await params).slug;
  const queryClient = getQueryClient();
  await queryClient.fetchQuery(trpc.blog.getOne.queryOptions({ slug }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <BlogSlugView slug={slug} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}

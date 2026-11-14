import { Metadata } from "next";
import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { RetryErrorBoundary } from "@/components/retry-error-boundary";
import { PostView } from "@/modules/posts/ui/views/post-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  // Decode URL-encoded params
  const decodedSlug = decodeURIComponent(slug);

  const queryClient = getQueryClient();
  const post = await queryClient.fetchQuery(
    trpc.posts.getOne.queryOptions({
      slug: decodedSlug,
    })
  );

  return {
    title: post.title,
  };
}

const Page = async ({ params }: Props) => {
  const { slug } = await params;

  // Decode URL-encoded params
  const decodedSlug = decodeURIComponent(slug);

  const queryClient = getQueryClient();
  await queryClient.fetchQuery(
    trpc.posts.getOne.queryOptions({
      slug: decodedSlug,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RetryErrorBoundary>
        <Suspense fallback={<p>Loading...</p>}>
          <PostView slug={decodedSlug} />
        </Suspense>
      </RetryErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

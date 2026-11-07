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

// ISR: generated on demand, cached, regenerated in the background at most
// hourly. Publishing/editing a post triggers on-demand revalidation.
export const revalidate = 3600;

// Enable on-demand static generation without prerendering paths at build time.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  // Decode URL-encoded params
  const decodedSlug = decodeURIComponent(slug);
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.blog.getOne.queryOptions({ slug: decodedSlug })
  );

  return {
    title: data.title,
    description: data.description,
  };
}

export default async function page({ params }: Props) {
  const slug = (await params).slug;
  // Decode URL-encoded params
  const decodedSlug = decodeURIComponent(slug);
  const queryClient = getQueryClient();
  await queryClient.fetchQuery(
    trpc.blog.getOne.queryOptions({ slug: decodedSlug })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <BlogSlugView slug={decodedSlug} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}

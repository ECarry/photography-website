import { Suspense } from "react";
import type { Metadata } from "next";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  BlogView,
  BlogViewLoadingStatus,
} from "@/modules/blog/ui/views/blog-view";
import { createSocialMetadata } from "@/lib/seo";

const description =
  "Field notes, travel stories, and the moments behind Sera's photographs.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  ...createSocialMetadata({
    title: "Blog",
    description,
    path: "/blog",
  }),
};

// ISR: serve the cached page and regenerate in the background at most hourly.
// Publishing/editing a post triggers on-demand revalidation (see posts router).
export const revalidate = 3600;

const page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.blog.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<BlogViewLoadingStatus />}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <BlogView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;

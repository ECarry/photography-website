import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";
import { loadSearchParams } from "@/modules/posts/params";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PostsListHeader } from "@/modules/posts/ui/components/posts-list-header";
import {
  DashboardPostsView,
  ErrorStatus,
  LoadingStatus,
} from "@/modules/posts/ui/views/dashboard-posts-view";

export const metadata = {
  title: "Posts",
  description: "Posts",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.posts.getMany.queryOptions({ ...filters }),
  );

  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <PostsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingStatus />}>
          <ErrorBoundary fallback={<ErrorStatus />}>
            <DashboardPostsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default page;

import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DiscoverView } from "@/modules/discover/ui/views/discover-view";

export const metadata = {
  title: "Discover",
  description: "Discover",
};

const page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.discover.getManyPhotos.queryOptions({}));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <DiscoverView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;

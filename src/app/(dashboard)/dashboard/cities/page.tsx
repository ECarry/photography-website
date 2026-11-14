import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RetryErrorBoundary } from "@/components/retry-error-boundary";
import {
  CityListView,
  CityListLoadingView,
} from "@/modules/cities/ui/views/city-list-view";

export const metadata = {
  title: "City Collection",
  description: "City Collection",
};

const CityPage = async () => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.city.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RetryErrorBoundary>
        <Suspense fallback={<CityListLoadingView />}>
          <CityListView />
        </Suspense>
      </RetryErrorBoundary>
    </HydrationBoundary>
  );
};

export default CityPage;

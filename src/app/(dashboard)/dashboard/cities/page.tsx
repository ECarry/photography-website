import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {
  CityListView,
  CityListLoadingView,
  CityListErrorView,
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
      <ErrorBoundary FallbackComponent={CityListErrorView}>
        <Suspense fallback={<CityListLoadingView />}>
          <CityListView />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default CityPage;

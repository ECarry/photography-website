import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {
  CityDetailView,
  CityDetailLoadingView,
  CityDetailErrorView,
} from "@/modules/cities/ui/views/city-detail-view";

type Props = {
  params: Promise<{
    city: string;
  }>;
};

const CityDetailPage = async ({ params }: Props) => {
  const { city } = await params;

  // Decode URL-encoded params
  const decodedCity = decodeURIComponent(city);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.city.getOne.queryOptions({
      city: decodedCity,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary FallbackComponent={CityDetailErrorView}>
        <Suspense fallback={<CityDetailLoadingView />}>
          <CityDetailView city={decodedCity} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default CityDetailPage;

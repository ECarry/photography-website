import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RetryErrorBoundary } from "@/components/retry-error-boundary";
import {
  CityDetailView,
  CityDetailLoadingView,
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
  await queryClient.prefetchQuery(
    trpc.city.getOne.queryOptions({
      city: decodedCity,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RetryErrorBoundary>
        <Suspense fallback={<CityDetailLoadingView />}>
          <CityDetailView city={decodedCity} />
        </Suspense>
      </RetryErrorBoundary>
    </HydrationBoundary>
  );
};

export default CityDetailPage;

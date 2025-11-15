import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MapView } from "@/modules/dashboard/ui/views/map-view";
import {
  ChartAreaView,
  ChartAreaLoading,
} from "@/modules/dashboard/ui/views/chart-area-view";
import {
  SectionCardsView,
  SectionCardsLoading,
} from "@/modules/dashboard/ui/views/section-cards-view";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.dashboard.getPhotosCountByMonth.queryOptions({ years: 3 })
  );
  void queryClient.prefetchQuery(
    trpc.dashboard.getVisitedCountries.queryOptions()
  );
  void queryClient.prefetchQuery(
    trpc.dashboard.getDashboardStats.queryOptions()
  );
  void queryClient.prefetchQuery(
    trpc.dashboard.getVisitedCountriesGeoJson.queryOptions()
  );

  return (
    <div className="py-4 px-4 md:px-8 flex flex-col">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground ">
          See your photos, travel history, and more.
        </p>
      </div>
      <div className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<SectionCardsLoading />}>
              <SectionCardsView />
            </Suspense>
            <Suspense fallback={<ChartAreaLoading />}>
              <ErrorBoundary fallback={<p>Error</p>}>
                <ChartAreaView />
              </ErrorBoundary>
            </Suspense>

            <MapView />
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
};

export default page;

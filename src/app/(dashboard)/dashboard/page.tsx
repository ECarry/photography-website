import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DashboardWidgets } from "@/modules/dashboard/ui/components/dashboard-widgets";
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
    trpc.dashboard.getVisitedCountriesWithGeoJson.queryOptions()
  );
  void queryClient.prefetchQuery(
    trpc.dashboard.getDashboardStats.queryOptions()
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
            <DashboardWidgets />
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
};

export default page;

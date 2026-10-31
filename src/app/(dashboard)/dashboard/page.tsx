import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DashboardWidgets } from "@/modules/dashboard/ui/components/dashboard-widgets";
import { DashboardOverviewHeader } from "@/modules/dashboard/ui/components/dashboard-overview-header";
import {
  SectionCardsView,
  SectionCardsLoading,
} from "@/modules/dashboard/ui/views/section-cards-view";
import {
  RecentPhotosLoading,
  RecentPhotosView,
} from "@/modules/dashboard/ui/views/recent-photos-view";
import { MetadataSummaryView } from "@/modules/dashboard/ui/views/metadata-summary-view";

const page = async () => {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(
      trpc.dashboard.getPhotosCountByMonth.queryOptions({ years: 3 }),
    ),
    queryClient.prefetchQuery(
      trpc.dashboard.getVisitedCountriesWithGeoJson.queryOptions(),
    ),
    queryClient.prefetchQuery(
      trpc.dashboard.getDashboardStats.queryOptions(),
    ),
    queryClient.prefetchQuery(
      trpc.dashboard.getRecentPhotos.queryOptions(),
    ),
    queryClient.prefetchQuery(
      trpc.dashboard.getPhotoMetadataSummary.queryOptions(),
    ),
  ]);

  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col px-4 py-7 md:px-6 md:py-8 xl:px-8">
        <DashboardOverviewHeader />
        <div className="mt-6 flex flex-col gap-4 md:mt-8 md:gap-5">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<SectionCardsLoading />}>
              <SectionCardsView />
            </Suspense>
            <DashboardWidgets />
            <Suspense fallback={<RecentPhotosLoading />}>
              <RecentPhotosView />
            </Suspense>
            <MetadataSummaryView />
          </HydrationBoundary>
        </div>
      </div>
    </main>
  );
};

export default page;

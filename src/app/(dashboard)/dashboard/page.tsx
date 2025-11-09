import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.dashboard.getPhotosCountByMonth.queryOptions({ years: 3 })
  );
  void queryClient.prefetchQuery(
    trpc.dashboard.getVisitedCountries.queryOptions()
  );

  return (
    <div className="px-4 md:px-8 flex flex-col">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground ">
          See your photos, travel history, and more.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>
          <ErrorBoundary fallback={<p>Error</p>}>
            <DashboardView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default page;

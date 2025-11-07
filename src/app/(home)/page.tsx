import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import ProfileCard from "@/modules/home/ui/components/profile-card";
import LatestTravelCard from "@/modules/home/ui/components/latest-travel-card";
import Footer from "@/modules/home/ui/components/footer";

import {
  CitiesView,
  CitiesViewLoadingStatus,
} from "@/modules/home/ui/views/cities-view";
import {
  SliderViewLoadingStatus,
  SliderView,
} from "@/modules/home/ui/views/slider-view";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.home.getManyLikePhotos.queryOptions({ limit: 10 })
  );
  void queryClient.prefetchQuery(
    trpc.home.getCitySets.queryOptions({ limit: 9 })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* LEFT CONTENT - Fixed */}
        <div className="w-full lg:w-1/2 h-[70vh] lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3 rounded-xl">
          <Suspense fallback={<SliderViewLoadingStatus />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <SliderView />
            </ErrorBoundary>
          </Suspense>
        </div>
        {/* Spacer for fixed left content */}
        <div className="hidden lg:block lg:w-1/2" />
        {/* RIGHT CONTENT - Scrollable */}
        <div className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
          {/* PROFILE CARD  */}
          <ProfileCard />

          {/* LAST TRAVEL CARD  */}
          <LatestTravelCard />

          {/* CITY SETS CARD  */}
          <Suspense fallback={<CitiesViewLoadingStatus />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <CitiesView />
            </ErrorBoundary>
          </Suspense>

          <Footer />
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default page;

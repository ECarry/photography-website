import { Suspense } from "react";
import type { Metadata } from "next";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  TravelView,
  LoadingStatus,
} from "@/modules/travel/ui/views/travel-view";
import { createSocialMetadata } from "@/lib/seo";

const description =
  "Browse travel photography by city. Explore destinations and photo stories from around the world.";

export const metadata: Metadata = {
  title: "Travel",
  description,
  ...createSocialMetadata({
    title: "Travel",
    description,
    path: "/travel",
    image: "/bg.jpg",
  }),
};

// ISR: revalidated on demand via the "photos" cache tag, hourly as backup.
export const revalidate = 3600;

const page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.travel.getCitySets.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LoadingStatus />}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <TravelView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;

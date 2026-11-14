import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { RetryErrorBoundary } from "@/components/retry-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ScreensaverView } from "@/modules/photograph/ui/views/screensaver-view";

export const metadata = {
  title: "Screensaver",
  description: "Screensaver",
};

const page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.discover.getScreensaverPhotos.queryOptions(),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <RetryErrorBoundary>
          <ScreensaverView />
        </RetryErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;

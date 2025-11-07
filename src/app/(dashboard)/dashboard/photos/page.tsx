import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";
import { loadSearchParams } from "@/modules/photos/params";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PhotosListHeader } from "@/modules/photos/ui/components/photos-list-header";
import {
  DashboardPhotosView,
  ErrorStatus,
  LoadingStatus,
} from "@/modules/photos/ui/views/dashboard-photos-view";

export const metadata = {
  title: "Photo Collection",
  description: "Photo Collection",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.photos.getMany.queryOptions({ ...filters })
  );

  return (
    <>
      <PhotosListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingStatus />}>
          <ErrorBoundary fallback={<ErrorStatus />}>
            <DashboardPhotosView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default page;

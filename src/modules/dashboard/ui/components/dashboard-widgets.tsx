"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RecentPhotosLoading,
  RecentPhotosView,
} from "@/modules/dashboard/ui/views/recent-photos-view";
import { MetadataSummaryView } from "@/modules/dashboard/ui/views/metadata-summary-view";

const ChartAreaView = dynamic(
  () =>
    import("@/modules/dashboard/ui/views/chart-area-view").then(
      (mod) => mod.ChartAreaView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-4 w-48" />
        <Skeleton className="mt-8 h-[320px] w-full" />
      </div>
    ),
  },
);

const MapView = dynamic(
  () =>
    import("@/modules/dashboard/ui/views/map-view").then(
      (mod) => mod.MapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="@container/countries min-h-[460px] overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-[#202020] dark:bg-[#080808]">
        <div className="flex h-14 items-center border-b border-[#E5E5E5] px-5 dark:border-[#202020]">
          <Skeleton className="h-4 w-24 bg-[#EEEEEE] dark:bg-white/10" />
        </div>
        <div className="grid min-h-[400px] grid-cols-1 @xl/countries:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
          <Skeleton className="h-[300px] w-full rounded-none bg-[#F2F4F2] dark:bg-[#101210] @xl/countries:h-[410px]" />
          <div className="space-y-3 border-t border-[#E5E5E5] p-4 dark:border-[#202020] @xl/countries:border-l @xl/countries:border-t-0">
            <Skeleton className="h-10 w-full bg-[#EEEEEE] dark:bg-white/10" />
            <Skeleton className="h-10 w-full bg-[#EEEEEE] dark:bg-white/10" />
            <Skeleton className="h-10 w-full bg-[#EEEEEE] dark:bg-white/10" />
            <Skeleton className="h-10 w-full bg-[#EEEEEE] dark:bg-white/10" />
          </div>
        </div>
      </div>
    ),
  },
);

export function DashboardWidgets() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
      <div className="min-w-0 xl:col-span-2">
        <MapView />
      </div>
      <div className="min-w-0 xl:col-span-2">
        <ChartAreaView />
      </div>
      <div className="min-w-0">
        <Suspense fallback={<RecentPhotosLoading />}>
          <RecentPhotosView />
        </Suspense>
      </div>
      <div className="min-w-0">
        <MetadataSummaryView />
      </div>
    </div>
  );
}

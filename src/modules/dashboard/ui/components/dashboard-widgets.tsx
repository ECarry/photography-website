"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="h-[420px] rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-3 h-4 w-48" />
        <Skeleton className="mt-6 h-[220px] w-full rounded-md" />
        <Skeleton className="mt-5 h-4 w-full" />
      </div>
    ),
  },
);

export function DashboardWidgets() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <ChartAreaView />
      </div>
      <div className="lg:col-span-5">
        <MapView />
      </div>
    </div>
  );
}

"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

function formatPercentChange(value: number) {
  return `${value > 0 ? "+" : ""}${value}% vs last year`;
}

export function SectionCardsView() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(
    trpc.dashboard.getDashboardStats.queryOptions(),
  );

  const metrics = [
    {
      label: "Total photos",
      value: stats.totalPhotos,
      detail: `${formatPercentChange(stats.thisYearPercentChange)} · all dates included`,
    },
    {
      label: "Photos this year",
      value: stats.thisYearPhotos,
      detail: formatPercentChange(stats.thisYearPercentChange),
    },
    {
      label: "Countries this year",
      value: stats.thisYearCountries,
      detail: formatPercentChange(stats.countriesPercentChange),
    },
    {
      label: "Cities this year",
      value: stats.thisYearCities,
      detail: formatPercentChange(stats.citiesPercentChange),
    },
  ];

  return (
    <section
      aria-label="Collection statistics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="flex min-h-[156px] flex-col justify-between rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#4D4D4D] dark:text-[#B3B3B3]">
              {metric.label}
            </h2>
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full bg-[#0072F5]"
            />
          </div>
          <div className="mt-5">
            <p className="text-[32px] font-semibold leading-10 tracking-[-1.28px] tabular-nums text-[#171717] dark:text-[#FAFAFA]">
              {metric.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs leading-4 text-[#8F8F8F]">
              {metric.detail}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export function SectionCardsLoading() {
  return (
    <div
      aria-label="Loading collection statistics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[156px] flex-col justify-between rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="size-2.5 rounded-full" />
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

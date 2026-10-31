"use client";

import Link from "next/link";
import { ArrowRight, Camera, CalendarDays, MapPin } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function MetadataSummaryView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.dashboard.getPhotoMetadataSummary.queryOptions(),
  );

  const details = [
    {
      label: "Capture date",
      count: data.missingCaptureDate,
      icon: CalendarDays,
    },
    {
      label: "Location",
      count: data.missingLocation,
      icon: MapPin,
    },
    {
      label: "Camera details",
      count: data.missingCameraDetails,
      icon: Camera,
    },
  ];
  const photosToReview = details.some((detail) => detail.count > 0);

  return (
    <section
      aria-labelledby="metadata-summary-title"
      className="flex h-full flex-col rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="metadata-summary-title"
            className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]"
          >
            Photo details
          </h2>
          <p className="mt-1 text-xs text-[#8F8F8F]">
            Optional information you can add to your archive.
          </p>
        </div>
        {photosToReview && (
          <Link
            href="/dashboard/photos"
            className="inline-flex w-fit items-center gap-1 text-xs font-medium text-[#4D4D4D] transition-colors hover:text-[#0072F5] dark:text-[#B3B3B3] dark:hover:text-[#52AEFF]"
          >
            Review photos
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </header>

      {photosToReview ? (
        <ul className="mt-5 grid flex-1 auto-rows-fr gap-2">
          {details.map(({ label, count, icon: Icon }) => (
            <li
              key={label}
              className="flex min-w-0 items-center gap-3 rounded-lg bg-[#FAFAFA] px-3 py-3 dark:bg-[#0A0A0A]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-[#8F8F8F] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-[#171717]">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
                {label}
              </span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-[#171717] dark:text-[#FAFAFA]">
                {count.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 flex flex-1 items-center rounded-lg bg-[#FAFAFA] px-4 py-5 text-sm text-[#4D4D4D] dark:bg-[#0A0A0A] dark:text-[#B3B3B3]">
          Your photos have capture dates, locations, and camera details.
        </p>
      )}
    </section>
  );
}

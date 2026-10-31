"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import BlurImage from "@/components/blur-image";
import { useTRPC } from "@/trpc/client";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

const uploadDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function RecentPhotosView() {
  const trpc = useTRPC();
  const { data: photos } = useSuspenseQuery(
    trpc.dashboard.getRecentPhotos.queryOptions(),
  );

  return (
    <section
      aria-labelledby="recent-photos-title"
      className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6"
    >
      <header className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2
            id="recent-photos-title"
            className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]"
          >
            Recently added
          </h2>
          <p className="mt-1 text-xs text-[#8F8F8F]">
            Your latest uploads, ready to revisit or edit.
          </p>
        </div>
        {photos.length > 0 && (
          <Link
            href="/dashboard/photos"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#4D4D4D] transition-colors hover:text-[#0072F5] dark:text-[#B3B3B3] dark:hover:text-[#52AEFF]"
          >
            All photos
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </header>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {photos.map((photo) => {
            const place = [photo.city || photo.region, photo.country]
              .filter(Boolean)
              .join(", ");

            return (
              <li key={photo.id} className="min-w-0">
                <Link
                  href={`/dashboard/photos/${photo.id}`}
                  aria-label={`Edit ${photo.title || "photo"}`}
                  className="group block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#262626]">
                    <BlurImage
                      src={keyToUrl(photo.url)}
                      alt={photo.title}
                      fill
                      blurhash={photo.blurData}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 639px) 45vw, (max-width: 1279px) 30vw, 16vw"
                    />
                  </div>
                  <div className="mt-2 min-w-0">
                    <p className="truncate text-xs font-medium text-[#171717] group-hover:text-[#0072F5] dark:text-[#FAFAFA]">
                      {photo.title || "Untitled photo"}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-[#8F8F8F]">
                      {place || "No location"}
                    </p>
                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] text-[#8F8F8F]">
                      {photo.visibility === "public" ? (
                        <Eye aria-hidden="true" className="size-3 shrink-0" />
                      ) : (
                        <EyeOff aria-hidden="true" className="size-3 shrink-0" />
                      )}
                      <span className="shrink-0">
                        {photo.visibility === "public" ? "Public" : "Private"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <time
                        dateTime={photo.createdAt.toISOString()}
                        className="truncate"
                      >
                        {uploadDateFormatter.format(photo.createdAt)}
                      </time>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg bg-[#FAFAFA] px-4 py-8 text-center dark:bg-[#0A0A0A]">
          <p className="text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
            No photos yet
          </p>
          <p className="mt-1 text-xs text-[#8F8F8F]">
            Add your first photo and it will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

export function RecentPhotosLoading() {
  return (
    <section
      aria-label="Loading recently added photos"
      className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-52" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="min-w-0">
            <Skeleton className="aspect-[4/3] w-full rounded-md" />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight, Images, MapPin } from "lucide-react";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import type { CityGetMany } from "../../types";

interface CityCardProps {
  citySet: CityGetMany[number];
}

export function CityCard({ citySet }: CityCardProps) {
  const {
    country,
    city,
    description,
    photoCount,
    coverPhotoUrl,
    coverPhotoBlurData,
  } = citySet;
  const href = `/dashboard/cities/${encodeURIComponent(city)}`;

  return (
    <Link
      href={href}
      aria-label={`Open ${city}, ${country}, ${photoCount} photos`}
      className="group block overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_0_0_1px_rgba(0,0,0,0.16)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FAFAFA,0_0_0_4px_#0072F5] dark:bg-[#171717] dark:focus-visible:shadow-[0_0_0_2px_#171717,0_0_0_4px_#0072F5]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F2F2F2] dark:bg-[#262626]">
        <BlurImage
          src={keyToUrl(coverPhotoUrl)}
          alt={`${city}, ${country}`}
          fill
          blurhash={coverPhotoBlurData}
          className="object-cover"
        />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-medium tracking-[-0.32px] text-[#171717] dark:text-[#FAFAFA]">
              {city}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8F8F8F]">
              <MapPin aria-hidden="true" className="size-3.5" />
              <span className="truncate">{country}</span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#F2F2F2] px-2 py-1 text-xs tabular-nums text-[#4D4D4D] dark:bg-[#262626] dark:text-[#B3B3B3]">
            <Images aria-hidden="true" className="size-3.5" />
            {photoCount}
          </span>
        </div>
        <div className="flex min-h-8 items-end justify-between gap-3">
          <p className="line-clamp-2 text-xs leading-4 text-[#8F8F8F]">
            {description || "Open this collection"}
          </p>
          <ArrowUpRight
            aria-hidden="true"
            className="mb-0.5 size-4 shrink-0 text-[#8F8F8F] group-hover:text-[#171717] dark:group-hover:text-[#FAFAFA]"
          />
        </div>
      </div>
    </Link>
  );
}

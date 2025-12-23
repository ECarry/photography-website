"use client";

import Link from "next/link";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import type { CityGetMany } from "../../types";

interface CityCardProps {
  citySet: CityGetMany[number];
}

export function CityCard({ citySet }: CityCardProps) {
  const { country, city, photoCount, coverPhotoUrl, coverPhotoBlurData } =
    citySet;

  const href = `/dashboard/cities/${encodeURIComponent(city)}`;

  return (
    <Link href={href} className="block">
      <div className="group relative aspect-3/4 overflow-hidden rounded-3xl bg-muted transition-all hover:shadow-md hover:scale-101 duration-300">
        {/* Background Image */}
        <BlurImage
          src={keyToUrl(coverPhotoUrl!)}
          alt={`${city}, ${country}`}
          fill
          className="object-cover"
          blurhash={coverPhotoBlurData!}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40" />

        {/* Top Left - Country and City */}
        <div className="absolute top-6 left-6 text-white">
          <h2 className="text-xl font-bold drop-shadow-lg">{country}</h2>
          <p className="text-lg font-medium drop-shadow-lg opacity-90">
            {city}
          </p>
        </div>

        {/* Bottom - Photo Count */}
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-lg font-medium drop-shadow-lg opacity-90">
            {photoCount}
          </p>
        </div>
      </div>
    </Link>
  );
}

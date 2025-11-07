"use client";

import BlurImage from "@/components/blur-image";
import { BrandsLogo } from "@/components/brands-logo";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatExposureTime } from "@/modules/photos/lib/utils";
import { keyToImage } from "@/lib/keyToImage";

interface PhotoPreviewCardProps {
  url: string;
  title?: string;
  imageInfo: {
    width: number;
    height: number;
    blurhash: string;
  };
  make?: string;
  model?: string;
  lensModel?: string;
  focalLength35mm?: number;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  dateTimeOriginal?: string;
  className?: string;
}

export function PhotoPreviewCard({
  url,
  title,
  imageInfo,
  make = "",
  model = "",
  lensModel = "",
  focalLength35mm,
  fNumber,
  exposureTime,
  iso,
  dateTimeOriginal,
  className,
}: PhotoPreviewCardProps) {
  // Calculate aspect ratio
  const aspectRatio = imageInfo.width / imageInfo.height;

  // Calculate container width based on aspect ratio and max height
  const containerWidth =
    aspectRatio >= 1
      ? `min(65vh * ${aspectRatio}, 90vw)` // Landscape or square
      : `min(65vh * ${aspectRatio}, 50vw)`; // Portrait

  return (
    <div className={cn("flex justify-center pb-14 w-full", className)}>
      <div
        className="bg-white relative shadow-2xl rounded-lg w-full"
        style={{
          maxWidth: containerWidth,
          aspectRatio: aspectRatio,
          maxHeight: "65dvh",
        }}
      >
        <BlurImage
          src={keyToImage(url)}
          alt={title || "Photo preview"}
          width={imageInfo.width}
          height={imageInfo.height}
          blurhash={imageInfo.blurhash}
          className="w-full h-full object-cover rounded-lg"
        />

        <div className="absolute -bottom-12 left-0 px-6 py-3 w-full bg-white flex justify-between items-center select-none text-gray-900 shadow-md rounded-b-lg">
          <div className="flex flex-col text-center">
            <h1
              className={cn(
                "font-semibold text-xs sm:text-sm lg:text-lg",
                aspectRatio < 1 ? "lg:text-sm" : "lg:text-lg"
              )}
            >
              <span className="flex items-center justify-center gap-1">
                {make} {model}
              </span>
            </h1>
            <p className="text-xs text-gray-500">{lensModel}</p>
          </div>
          <div className="flex items-center gap-2">
            <BrandsLogo brand={make || ""} />
            {aspectRatio >= 1 && (
              <>
                <Separator
                  orientation="vertical"
                  className="hidden sm:block h-10 bg-gray-300"
                />
                <div className="hidden sm:flex flex-col gap-[2px]">
                  <div className="space-x-[6px] text-xs lg:text-sm font-mono text-gray-800">
                    <span>
                      {focalLength35mm && focalLength35mm + "mm"}
                    </span>
                    <span>{fNumber && "ƒ/" + fNumber}</span>
                    <span>
                      {exposureTime && formatExposureTime(exposureTime)}
                    </span>
                    <span>{iso && "ISO" + iso}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <p>
                      {dateTimeOriginal &&
                        new Date(dateTimeOriginal).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

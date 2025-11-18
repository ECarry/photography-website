"use client";

import { cn } from "@/lib/utils";
import BlurImage from "./blur-image";
import { keyToImage } from "@/lib/keyToImage";

interface FramedPhotoProps {
  src: string;
  alt?: string;
  blurhash: string;
  width?: number;
  height?: number;
  className?: string;
}

export function FramedPhoto({
  src,
  alt = "Framed photo",
  blurhash,
  width,
  height,
  className,
}: FramedPhotoProps) {
  return (
    <div className="relative inline-block shadow-[10px_10px_8px_rgba(0,0,0,0.65)]">
      <div className="relative box-border border-10 border-neutral-700 bg-neutral-700">
        <div
          className={cn(
            "relative bg-white p-4",
            "shadow-[inset_0_0_18px_rgba(0,0,0,0.16)]",
            "before:pointer-events-none before:absolute before:content-['']",
            "before:inset-x-0 before:top-0 before:h-3 before:bg-linear-to-b before:from-black/25 before:via-black/25 before:to-transparent",
            "after:pointer-events-none after:absolute after:content-['']",
            "after:inset-y-0 after:left-0 after:w-3 after:bg-linear-to-r after:from-black/25 after:via-black/25 after:to-transparent"
          )}
        >
          <BlurImage
            src={keyToImage(src)}
            alt={alt}
            blurhash={blurhash}
            className={cn(
              "block w-full h-auto max-h-[80vh] object-cover border border-neutral-200",
              className
            )}
            width={width}
            height={height}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import BlurImage from "./blur-image";
import { keyToImage } from "@/lib/keyToImage";

interface FramedPhotoProps {
  src: string;
  alt?: string;
  className?: string;
  blurhash: string;
  width?: number;
  height?: number;
  aspectRatio: number;
}

export function FramedPhoto({
  src,
  alt = "Framed photo",
  blurhash,
  className,
  width,
  height,
  aspectRatio,
}: FramedPhotoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gray-50",
        className,
        aspectRatio < 1 ? "px-20 py-30" : "px-10 py-30"
      )}
    >
      <div className="relative inline-block shadow-[10px_10px_10px_rgba(0,0,0,0.65)]">
        <div className="relative box-border border-8 border-neutral-900 bg-neutral-900">
          <div
            className={cn(
              "relative bg-white p-4",
              "shadow-[inset_0_0_18px_rgba(0,0,0,0.16)]"
            )}
          >
            <BlurImage
              src={keyToImage(src)}
              alt={alt}
              blurhash={blurhash}
              className="block w-full h-auto object-cover border border-neutral-200"
              width={width}
              height={height}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

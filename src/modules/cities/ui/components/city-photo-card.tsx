"use client";

import {
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurImage from "@/components/blur-image";
import Link from "next/link";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import type { CityGetOne } from "../../types";
import { formatPhotoDate } from "@/modules/cities/format-photo-date";

type CityPhoto = NonNullable<CityGetOne>["photos"][number];

const galleryFrames = {
  portrait: "/gallery-frames/black-matted-portrait.png",
  landscape: "/gallery-frames/black-matted-landscape.png",
};

interface CityPhotoCardProps {
  photo: CityPhoto;
  city: string;
  isCoverPhoto: boolean;
  isCoverMutationPending: boolean;
  isPhotoMutationPending: boolean;
  onSetCover: (photoId: string) => void;
  onToggleVisibility: (photo: CityPhoto) => void;
  onToggleFavorite: (photo: CityPhoto) => void;
}

export function CityPhotoCard({
  photo,
  city,
  isCoverPhoto,
  isCoverMutationPending,
  isPhotoMutationPending,
  onSetCover,
  onToggleVisibility,
  onToggleFavorite,
}: CityPhotoCardProps) {
  const isPublicPhoto = photo.visibility === "public";
  const aspectRatio =
    photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 1;
  const frameImage =
    aspectRatio < 1
      ? galleryFrames.portrait
      : galleryFrames.landscape;
  const frameScale = 0.9;
  const frameOffset = 5;
  const scaleFrameInset = (value: number) =>
    `${frameOffset + value * frameScale}%`;
  const photoWindow =
    aspectRatio < 1
      ? {
          left: scaleFrameInset(22.25),
          right: scaleFrameInset(22.25),
          top: scaleFrameInset(8.25),
          bottom: scaleFrameInset(8.125),
        }
      : {
          left: scaleFrameInset(8.125),
          right: scaleFrameInset(8.125),
          top: scaleFrameInset(22.5),
          bottom: scaleFrameInset(22.375),
        };
  const coverLabel = isCoverPhoto
    ? isPublicPhoto
      ? "Current public cover photo"
      : "Current cover is private; choose a public photo"
    : isPublicPhoto
      ? "Set as city cover"
      : "Private photos cannot be city covers";
  const visibilityLabel =
    isCoverPhoto && isPublicPhoto
      ? "Choose another cover before making this photo private"
      : isPublicPhoto
        ? "Make photo private"
        : "Make photo public";

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square w-full bg-muted">
        <div>
          <div className="absolute overflow-hidden" style={photoWindow}>
            <BlurImage
              src={keyToUrl(photo.url)}
              alt={photo.title || `${city} photo`}
              blurhash={photo.blurData}
              fill
              className="object-cover"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[5%] bottom-[5%] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${frameImage}")` }}
          />
        </div>

        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSetCover(photo.id)}
            disabled={isCoverMutationPending || !isPublicPhoto}
            aria-label={coverLabel}
            aria-pressed={isCoverPhoto}
            title={coverLabel}
            className={`size-8 rounded-full bg-white text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-[#F2F2F2] ${
              isCoverPhoto ? "text-[#0072F5]" : ""
            }`}
          >
            {isCoverPhoto ? (
              <ImageIcon className="size-3.5" />
            ) : (
              <ImagePlus className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleVisibility(photo)}
            disabled={
              isPhotoMutationPending || (isCoverPhoto && isPublicPhoto)
            }
            aria-label={visibilityLabel}
            title={visibilityLabel}
            className="size-8 rounded-full bg-white text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-[#F2F2F2]"
          >
            {isPublicPhoto ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(photo)}
            disabled={isPhotoMutationPending}
            aria-label={
              photo.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={photo.isFavorite}
            title={
              photo.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className={`size-8 rounded-full bg-white text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-[#F2F2F2] ${
              photo.isFavorite ? "text-[#E5484D]" : ""
            }`}
          >
            <Heart
              className={
                photo.isFavorite ? "size-3.5 fill-current" : "size-3.5"
              }
            />
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-1.5 max-w-[220px] px-1 text-center">
        <h3 className="line-clamp-1 text-xs font-medium text-[#292929] dark:text-[#FAFAFA]">
          {photo.title || "Untitled photo"}
        </h3>
        {photo.dateTimeOriginal && (
          <time
            dateTime={photo.dateTimeOriginal.toISOString()}
            className="mt-1 block text-[10px] text-[#8F8F8F]"
          >
            {formatPhotoDate(photo.dateTimeOriginal)}
          </time>
        )}
        <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-[#8F8F8F]">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${
              isPublicPhoto ? "bg-[#398E4A]" : "bg-[#8F8F8F]"
            }`}
          />
          {isPublicPhoto ? "Public" : "Private"}
        </span>
      </div>
    </article>
  );
}

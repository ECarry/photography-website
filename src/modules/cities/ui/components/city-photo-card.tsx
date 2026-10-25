"use client";

import { Check, Eye, EyeOff, Heart, Image as ImageIcon, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import type { CityGetOne } from "../../types";
import { formatPhotoDate } from "@/modules/cities/format-photo-date";

type CityPhoto = NonNullable<CityGetOne>["photos"][number];

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
    <article className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F2] dark:bg-[#262626]">
        <BlurImage
          src={keyToUrl(photo.url)}
          alt={photo.title || `${city} photo`}
          blurhash={photo.blurData}
          fill
          className="object-cover"
        />
        {isCoverPhoto && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-medium text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] dark:text-[#FAFAFA]">
            <Check aria-hidden="true" className="size-3.5 text-[#0072F5]" />
            Cover
          </span>
        )}
      </div>

      <div className="space-y-3 p-3">
        <div className="flex min-h-10 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
              {photo.title || "Untitled photo"}
            </h3>
            <p className="mt-1 text-xs text-[#8F8F8F]">
              {photo.dateTimeOriginal
                ? formatPhotoDate(photo.dateTimeOriginal)
                : "Date not recorded"}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                isPublicPhoto ? "bg-[#398E4A]" : "bg-[#8F8F8F]"
              }`}
            />
            {isPublicPhoto ? "Public" : "Private"}
          </span>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-[#EBEBEB] pt-2 dark:border-[#303030]">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onSetCover(photo.id)}
            disabled={isCoverMutationPending || !isPublicPhoto}
            aria-label={coverLabel}
            aria-pressed={isCoverPhoto}
            title={coverLabel}
            className={isCoverPhoto ? "text-[#0072F5]" : "text-[#4D4D4D]"}
          >
            {isCoverPhoto ? (
              <ImageIcon className="size-4" />
            ) : (
              <ImagePlus className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onToggleVisibility(photo)}
            disabled={
              isPhotoMutationPending || (isCoverPhoto && isPublicPhoto)
            }
            aria-label={visibilityLabel}
            title={visibilityLabel}
            className="text-[#4D4D4D] dark:text-[#B3B3B3]"
          >
            {isPublicPhoto ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onToggleFavorite(photo)}
            disabled={isPhotoMutationPending}
            aria-label={
              photo.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={photo.isFavorite}
            title={
              photo.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className={
              photo.isFavorite
                ? "text-[#E5484D]"
                : "text-[#4D4D4D] dark:text-[#B3B3B3]"
            }
          >
            <Heart className={photo.isFavorite ? "size-4 fill-current" : "size-4"} />
          </Button>
        </div>
      </div>
    </article>
  );
}

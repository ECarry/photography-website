"use client";

import { Eye, EyeOff, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import type { photoGetMany } from "../../types";
import { DeletePhotoButton } from "./delete-photo-button";
import { FavoriteToggle } from "./favorite-toggle";

interface DashboardPhotoCardProps {
  photo: photoGetMany[number];
  selected: boolean;
  isUpdating: boolean;
  onSelect: (selected: boolean) => void;
  onToggleVisibility: () => void;
}

const photoDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function DashboardPhotoCard({
  photo,
  selected,
  isUpdating,
  onSelect,
  onToggleVisibility,
}: DashboardPhotoCardProps) {
  const isPublic = photo.visibility === "public";

  return (
    <article
      className={`overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] ${
        selected ? "ring-2 ring-[#0072F5] ring-offset-2" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F2] dark:bg-[#262626]">
        <BlurImage
          src={keyToUrl(photo.url)}
          alt={photo.title || "Photo"}
          blurhash={photo.blurData}
          fill
          className="object-cover"
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
        />
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(checked === true)}
          aria-label={`Select ${photo.title || "photo"}`}
          className="absolute left-3 top-3 size-5 border-0 bg-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
        />
      </div>

      <div className="space-y-3 p-3">
        <div className="flex min-h-10 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
              {photo.title || "Untitled photo"}
            </h3>
            <p className="mt-1 text-xs text-[#8F8F8F]">
              {photo.dateTimeOriginal
                ? photoDateFormatter.format(photo.dateTimeOriginal)
                : "Date not recorded"}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                isPublic ? "bg-[#398E4A]" : "bg-[#8F8F8F]"
              }`}
            />
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-[#EBEBEB] pt-2 dark:border-[#303030]">
          <FavoriteToggle
            key={`${photo.id}-${photo.isFavorite}`}
            photoId={photo.id}
            initialValue={photo.isFavorite}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isUpdating}
            onClick={onToggleVisibility}
            aria-label={isPublic ? "Make photo private" : "Make photo public"}
            title={isPublic ? "Make photo private" : "Make photo public"}
            className="h-8 w-8 text-[#4D4D4D] hover:bg-[#EBEBEB] dark:text-[#B3B3B3] dark:hover:bg-[#262626]"
          >
            {isPublic ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="h-8 px-2 text-xs text-[#4D4D4D] hover:bg-[#EBEBEB] dark:text-[#B3B3B3] dark:hover:bg-[#262626]"
          >
            <Link href={`/dashboard/photos/${photo.id}`}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
          <DeletePhotoButton
            photoId={photo.id}
            photoTitle={photo.title || "Untitled photo"}
          />
        </div>
      </div>
    </article>
  );
}

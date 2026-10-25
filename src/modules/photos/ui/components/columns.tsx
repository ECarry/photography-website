"use client";

import { ColumnDef } from "@tanstack/react-table";
import { photoGetMany } from "../../types";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import BlurImage from "@/components/blur-image";
import { format } from "date-fns";
import { FavoriteToggle } from "./favorite-toggle";
import { VisibilityToggle } from "./visibility-toggle";
import { DeletePhotoButton } from "./delete-photo-button";
import Link from "next/link";
import { PenBoxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<photoGetMany[number]>[] = [
  {
    accessorKey: "url",
    header: "Image",
    cell: ({ row }) => {
      const url = row.original.url;
      const imageUrl = keyToUrl(url);

      return (
        <div className="relative size-12 overflow-hidden rounded-md bg-[#F2F2F2] dark:bg-[#262626]">
          <BlurImage
            src={imageUrl}
            alt={row.original.title}
            width={48}
            height={48}
            blurhash={row.original.blurData}
            className="size-12 object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[280px] min-w-[160px]">
        <p className="truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
          {row.original.title || "Untitled photo"}
        </p>
        <p className="mt-1 truncate text-xs text-[#8F8F8F]">
          {row.original.description || "No description"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "dateTimeOriginal",
    header: "Taken At",
    cell: ({ row }) => {
      const takenAt = row.original.dateTimeOriginal;
      if (!takenAt) return <span>-</span>;

      // Use date-fns for consistent formatting across SSR and client
      const formatted = format(new Date(takenAt), "MMM d, yyyy HH:mm");

      return (
        <span
          suppressHydrationWarning
          className="whitespace-nowrap text-xs tabular-nums text-[#4D4D4D] dark:text-[#B3B3B3]"
        >
          {formatted}
        </span>
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const city = row.original.city ?? row.original.region;
      const location = [city, row.original.countryCode]
        .filter(Boolean)
        .join(", ");
      return (
        <span className="text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
          {location || "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "isFavorite",
    header: "Favorite",
    cell: ({ row }) => {
      return (
        <FavoriteToggle
          key={`${row.original.id}-${row.original.isFavorite}`}
          photoId={row.original.id}
          initialValue={row.original.isFavorite}
        />
      );
    },
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => {
      return (
        <VisibilityToggle
          key={`${row.original.id}-${row.original.visibility}`}
          photoId={row.original.id}
          initialValue={row.original.visibility}
        />
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <DeletePhotoButton
            photoId={row.original.id}
            photoTitle={row.original.title}
          />

          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/photos/${row.original.id}`}>
              <PenBoxIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { photoGetMany } from "../../types";
import { keyToImage } from "@/lib/keyToImage";
import BlurImage from "@/components/blur-image";
import { format } from "date-fns";
import { FavoriteToggle } from "./favorite-toggle";
import { VisibilityToggle } from "./visibility-toggle";
import { DeletePhotoButton } from "./delete-photo-button";

export const columns: ColumnDef<photoGetMany[number]>[] = [
  {
    accessorKey: "url",
    header: "Image",
    cell: ({ row }) => {
      const url = row.original.url;
      const imageUrl = keyToImage(url);

      return (
        <div className="w-16 h-16 overflow-hidden">
          <BlurImage
            src={imageUrl}
            alt={row.original.title}
            width={64}
            height={64}
            blurhash={row.original.blurData}
            className="w-16 h-16 object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "dateTimeOriginal",
    header: "Taken At",
    cell: ({ row }) => {
      const takenAt = row.original.dateTimeOriginal;
      if (!takenAt) return <span>-</span>;

      // Use date-fns for consistent formatting across SSR and client
      const formatted = format(new Date(takenAt), "MMM d, yyyy HH:mm");

      return <span suppressHydrationWarning>{formatted}</span>;
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const location = row.original.city + ", " + row.original.countryCode;
      return <span>{location}</span>;
    },
  },
  {
    accessorKey: "isFavorite",
    header: "Favorite",
    cell: ({ row }) => {
      return (
        <FavoriteToggle
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
        <DeletePhotoButton
          photoId={row.original.id}
          photoTitle={row.original.title}
        />
      );
    },
  },
];

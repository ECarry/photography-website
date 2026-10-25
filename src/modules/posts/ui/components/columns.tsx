"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PostGetMany } from "../../types";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { VisibilityToggle } from "./visibility-toggle";
import { DeletePostButton } from "./delete-post-button";
import Link from "next/link";
import { Image as ImageIcon, PenBoxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<PostGetMany[number]>[] = [
  {
    accessorKey: "coverImage",
    header: "Cover",
    cell: ({ row }) => (
      <div className="relative size-12 overflow-hidden rounded-md bg-[#F2F2F2] dark:bg-[#262626]">
        {row.original.coverImage ? (
          <BlurImage
            src={keyToUrl(row.original.coverImage)}
            alt=""
            blurhash=""
            width={48}
            height={48}
            className="size-12 object-cover"
          />
        ) : (
          <div className="flex size-12 items-center justify-center text-[#8F8F8F]">
            <ImageIcon aria-hidden="true" className="size-4" />
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Story",
    cell: ({ row }) => (
      <div className="min-w-[220px] max-w-[520px]">
        <p className="truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
          {row.original.title}
        </p>
        <p className="mt-1 truncate text-xs text-[#8F8F8F]">
          {row.original.description || `/blog/${row.original.slug}`}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => {
      return (
        <VisibilityToggle
          key={`${row.original.id}-${row.original.visibility}`}
          postId={row.original.id}
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
        <div className="flex items-center justify-end gap-1">
          <DeletePostButton
            postId={row.original.id}
            postTitle={row.original.title}
          />

          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={`Edit ${row.original.title}`}
            title="Edit story"
            className="text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
          >
            <Link href={`/dashboard/posts/${row.original.slug}`}>
              <PenBoxIcon className="size-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

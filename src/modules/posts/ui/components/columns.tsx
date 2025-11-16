"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PostGetMany } from "../../types";
import { VisibilityToggle } from "./visibility-toggle";
import { DeletePostButton } from "./delete-post-button";
import Link from "next/link";

export const columns: ColumnDef<PostGetMany[number]>[] = [
  {
    accessorKey: "title",
    header: "Title",
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
        <>
          <DeletePostButton
            postId={row.original.id}
            postTitle={row.original.title}
          />
          <Link href={`/dashboard/posts/${row.original.slug}`}>View</Link>
        </>
      );
    },
  },
];

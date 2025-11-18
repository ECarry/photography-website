"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PostGetMany } from "../../types";
import { VisibilityToggle } from "./visibility-toggle";
import { DeletePostButton } from "./delete-post-button";
import Link from "next/link";
import { PenBoxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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

          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/posts/${row.original.slug}`}>
              <PenBoxIcon className="h-4 w-4" />
            </Link>
          </Button>
        </>
      );
    },
  },
];

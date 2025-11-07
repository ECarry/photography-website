"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface VisibilityToggleProps {
  photoId: string;
  initialValue: "public" | "private";
}

export function VisibilityToggle({
  photoId,
  initialValue,
}: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState(initialValue);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updatePost = useMutation(trpc.posts.update.mutationOptions());

  const handleToggle = async (checked: boolean) => {
    const newValue = checked ? "public" : "private";

    // Optimistic update
    setVisibility(newValue);

    updatePost.mutate(
      {
        id: photoId,
        visibility: newValue,
      },
      {
        onSuccess: async () => {
          // Invalidate queries to refetch posts list
          await queryClient.invalidateQueries(
            trpc.posts.getMany.queryOptions({})
          );
          toast.success(
            `Post is now ${newValue === "public" ? "public" : "private"}`
          );
        },
        onError: (error) => {
          // Revert on error
          setVisibility(newValue === "public" ? "private" : "public");
          toast.error(error.message || "Failed to update visibility");
        },
      }
    );
  };

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {visibility === "public" ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
      <Switch
        checked={visibility === "public"}
        onCheckedChange={handleToggle}
        disabled={updatePost.isPending}
        aria-label="Toggle visibility"
      />
      <span className="text-sm text-muted-foreground min-w-[50px]">
        {visibility === "public" ? "Public" : "Private"}
      </span>
    </div>
  );
}

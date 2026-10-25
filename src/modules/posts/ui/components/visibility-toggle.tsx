"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface VisibilityToggleProps {
  postId: string;
  initialValue: "public" | "private";
}

export function VisibilityToggle({
  postId,
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
        id: postId,
        visibility: newValue,
      },
      {
        onSuccess: async () => {
          // Invalidate queries to refetch posts list
          await queryClient.invalidateQueries(
            trpc.posts.getMany.queryOptions({})
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
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${
          visibility === "public" ? "bg-[#398E4A]" : "bg-[#8F8F8F]"
        }`}
      />
      <span className="min-w-[48px] text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
        {visibility === "public" ? "Public" : "Private"}
      </span>
      <Switch
        checked={visibility === "public"}
        onCheckedChange={handleToggle}
        disabled={updatePost.isPending}
        aria-label="Toggle visibility"
      />
    </div>
  );
}

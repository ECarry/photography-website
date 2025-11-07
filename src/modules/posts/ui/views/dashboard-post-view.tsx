"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { DashboardPostViewHeader } from "../components/dashboard-post-view-header";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

export const DashboardPostView = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.posts.getOne.queryOptions({ slug }));

  const [ConfirmationDialog, confirm] = useConfirm(
    "Delete post",
    "Are you sure you want to delete this post?"
  );

  // const deleteFileMutation = useMutation(
  //   trpc.cloudflare.deleteFile.mutationOptions({
  //     onError: () => {
  //       toast.error("Failed to delete file");
  //     },
  //   })
  // );
  const removePost = useMutation(
    trpc.posts.remove.mutationOptions({
      onSuccess: async () => {
        // if (data.coverImageKey) {
        //   deleteFileMutation.mutate({ key: data.coverImageKey });
        // }
        await queryClient.invalidateQueries(
          trpc.posts.getMany.queryOptions({})
        );
        router.push("/dashboard/posts");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    removePost.mutate({ id: data.id });
  };

  return (
    <>
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <DashboardPostViewHeader
          title={data.title}
          onRemove={handleRemove}
          onSave={() => {}}
        />
        {JSON.stringify(data, null, 2)}
      </div>
      <ConfirmationDialog />
    </>
  );
};

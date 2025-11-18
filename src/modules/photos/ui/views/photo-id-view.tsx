"use client";

import { FramedPhoto } from "@/components/framed-photo";
import { photosUpdateSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

interface PhotoIdViewProps {
  id: string;
}

const formSchema = photosUpdateSchema;

export const PhotoIdView = ({ id }: PhotoIdViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.photos.getOne.queryOptions({
      id,
    })
  );

  const updateMutation = useMutation(
    trpc.photos.update.mutationOptions({
      onSuccess: () => {},
      onError: () => {},
    })
  );

  return (
    <div>
      <FramedPhoto
        src={data.url}
        alt={data.title}
        blurhash={data.blurData}
        width={data.width}
        height={data.height}
      />
    </div>
  );
};

"use client";

import BlurImage from "@/components/blur-image";
import { PhotoPreviewCard } from "@/modules/photos/ui/components/photo-preview-card";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface PhotographViewProps {
  id: string;
}

export const PhotographView = ({ id }: PhotographViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.home.getPhotoById.queryOptions({ id })
  );

  const imageInfo = {
    width: data.width,
    height: data.height,
    blurhash: data.blurData,
  };

  return (
    <div className="h-screen flex justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <BlurImage
          src={keyToUrl(data.url)}
          alt={data.title || "Photo background"}
          fill
          sizes="100vw"
          blurhash={data.blurData}
          className="object-cover blur-lg scale-110"
        />
        <div className="absolute inset-0 bg-background/20" />
      </div>

      <PhotoPreviewCard
        url={data.url}
        title={data.title}
        imageInfo={imageInfo}
        make={data.make}
        model={data.model}
        lensModel={data.lensModel}
        focalLength35mm={data.focalLength35mm}
        fNumber={data.fNumber}
        exposureTime={data.exposureTime}
        iso={data?.iso}
        dateTimeOriginal={
          data?.dateTimeOriginal ? data.dateTimeOriginal.toString() : undefined
        }
      />
    </div>
  );
};

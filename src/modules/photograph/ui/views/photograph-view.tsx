"use client";

import BlurImage from "@/components/blur-image";
import { Skeleton } from "@/components/ui/skeleton";
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

export const LoadingState = () => {
  const aspectRatio = 3 / 2;
  const containerWidth = `min(65vh * ${aspectRatio}, 90vw)`;

  return (
    <div className="h-screen flex justify-center items-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-muted blur-2xl scale-110" />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="flex justify-center pb-14 w-full">
        <div
          className="bg-background relative shadow-2xl rounded-lg w-full border"
          style={{
            maxWidth: containerWidth,
            aspectRatio: aspectRatio,
            maxHeight: "65dvh",
          }}
        >
          <Skeleton className="w-full h-full rounded-lg" />

          <div className="absolute -bottom-12 left-0 px-6 py-3 w-full bg-background flex justify-between items-center select-none shadow-md rounded-b-lg border-t">
            <div className="flex flex-col text-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="hidden sm:flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

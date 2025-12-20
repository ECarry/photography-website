"use client";

// UI Components
import Link from "next/link";
import Carousel from "@/components/photo-carousel";
import BlurImage from "@/components/blur-image";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ImageOff } from "lucide-react";

export const SliderView = () => {
  const trpc = useTRPC();
  const { data: photos } = useSuspenseQuery(
    trpc.home.getManyLikePhotos.queryOptions({ limit: 10 })
  );

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="h-12 w-12" />}
        title="No photos yet"
        description="Upload some photos and like your favorites to get started"
        action={
          <Button asChild>
            <Link href="/dashboard/photos">Go to Dashboard</Link>
          </Button>
        }
        height="h-full"
      />
    );
  }

  return (
    <Carousel
      className="absolute top-0 left-0 w-full h-full rounded-xl"
      containerClassName="h-full"
    >
      {photos.map((photo, index) => {
        const isFirstSlide = index === 0;

        return (
          <div key={photo.id} className="flex-[0_0_100%] h-full relative">
            <BlurImage
              src={keyToUrl(photo.url)}
              alt={photo.title}
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              loading={isFirstSlide ? "eager" : "lazy"}
              fetchPriority={isFirstSlide ? "high" : undefined}
              blurhash={photo.blurData}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </Carousel>
  );
};

export const SliderViewLoadingStatus = () => {
  return (
    <div className="w-full lg:w-1/2 h-[70vh] lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3 rounded-xl">
      <Skeleton className="w-full h-full" />
    </div>
  );
};

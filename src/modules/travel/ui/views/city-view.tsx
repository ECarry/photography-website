"use client";

import BlurImage from "@/components/blur-image";
import Footer from "@/components/footer";
import VectorCombined from "@/components/vector-combined";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

const galleryDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const galleryFrames = {
  portrait: "/gallery-frames/black-matted-portrait.png",
  landscape: "/gallery-frames/black-matted-landscape.png",
};

interface Props {
  city: string;
}

export const CityView = ({ city }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.travel.getOne.queryOptions({ city }));

  const coverPhoto = data.photos.find((item) => data.coverPhotoId === item.id);
  const coverPhotoDate = coverPhoto?.dateTimeOriginal
    ? new Date(coverPhoto.dateTimeOriginal)
    : null;
  const coverPhotoYear =
    coverPhotoDate && !Number.isNaN(coverPhotoDate.getTime())
      ? coverPhotoDate.getUTCFullYear()
      : "-";

  return (
    <div className="size-full">
      <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
        {/* LEFT CONTENT - Fixed */}
        <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
          <div className="w-full h-full relative">
            <BlurImage
              src={keyToUrl(coverPhoto?.url) || "/placeholder.svg"}
              alt={data.city}
              fill
              quality={75}
              blurhash={coverPhoto?.blurData || ""}
              sizes="75vw"
              className="object-cover rounded-xl overflow-hidden"
            />
            <div className="absolute right-0 bottom-0">
              <VectorCombined title={data.city} position="bottom-right" />
            </div>
          </div>
        </div>

        {/* Spacer for fixed left content */}
        <div className="hidden lg:block lg:w-1/2" />

        {/* RIGHT CONTENT - Scrollable */}
        <div className="w-full lg:w-1/2 space-y-3 pb-3">
          {/* CITY INFO CARD  */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3 gap-4 items-stretch">
            <div className="col-span-1 md:col-span-2 lg:col-span-1 2xl:col-span-2">
              <div className="flex flex-col p-10 gap-24 bg-muted rounded-xl font-light relative h-full">
                <div className="flex gap-4 items-center">
                  {/* NAME  */}
                  <div className="flex flex-col gap-[2px]">
                    <h1 className="text-4xl">
                      {data.city} {data.countryCode}
                    </h1>
                  </div>
                </div>

                <div>
                  <p className="text-text-muted text-[15px]">
                    {data.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-1 lg:col-span-1 2xl:col-span-1 flex flex-col gap-3">
              <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
                <p className="text-xs text-text-muted">Country</p>
                <p className="text-xs">{data.country}</p>
              </div>

              <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
                <p className="text-xs text-text-muted">City</p>
                <p className="text-xs">{data.city}</p>
              </div>

              <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
                <p className="text-xs text-text-muted">Year</p>
                <p className="text-xs">{coverPhotoYear}</p>
              </div>

              <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
                <p className="text-xs text-text-muted">Photos</p>
                <p className="text-xs">{data.photos?.length}</p>
              </div>
            </div>
          </div>

          {/* IMAGES  */}
          <div className="grid w-full grid-cols-2 gap-x-[1px] gap-y-6">
            {data.photos?.map((photo) => {
              const aspectRatio =
                photo.width > 0 && photo.height > 0
                  ? photo.width / photo.height
                  : 1;
              const frameImage =
                aspectRatio < 1
                  ? galleryFrames.portrait
                  : galleryFrames.landscape;
              const photoWindow =
                aspectRatio < 1
                  ? {
                      left: "22.25%",
                      right: "22.25%",
                      top: "8.25%",
                      bottom: "8.125%",
                    }
                  : {
                      left: "8.125%",
                      right: "8.125%",
                      top: "22.5%",
                      bottom: "22.375%",
                    };

              return (
                <Link
                  href={`/p/${photo.id}`}
                  key={photo.id}
                  aria-label={`View ${photo.title || "photo"}`}
                  className="group min-w-0"
                >
                  <div className="relative aspect-square w-full bg-[#F5F5F5]">
                    <div
                      className="absolute overflow-hidden"
                      style={photoWindow}
                    >
                      <BlurImage
                        src={keyToUrl(photo.url)}
                        alt={photo.title || `Photo from ${data.city}`}
                        fill
                        blurhash={photo.blurData || ""}
                        className="object-cover"
                        sizes="(max-width: 639px) 28vw, 18vw"
                      />
                    </div>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url("${frameImage}")` }}
                    />
                  </div>
                  <div className="mx-auto mt-1.5 max-w-[220px] px-1 text-center">
                    <p className="line-clamp-1 text-xs font-medium text-[#292929] dark:text-[#FAFAFA]">
                      {photo.title || "Untitled photograph"}
                    </p>
                    {photo.dateTimeOriginal && (
                      <time
                        dateTime={photo.dateTimeOriginal.toISOString()}
                        className="mt-1 block text-[10px] text-[#8F8F8F]"
                      >
                        {galleryDateFormatter.format(
                          photo.dateTimeOriginal,
                        )}
                      </time>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {/* FOOTER  */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

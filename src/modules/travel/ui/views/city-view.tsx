"use client";

import BlurImage from "@/components/blur-image";
import Footer from "@/components/footer";
import { FramedPhoto } from "@/components/framed-photo";
import VectorCombined from "@/components/vector-combined";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";

interface Props {
  city: string;
}

export const CityView = ({ city }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.travel.getOne.queryOptions({ city }));

  const coverPhoto = data.photos.find((item) => data.coverPhotoId === item.id);

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
                <p className="text-xs">
                  {new Date(coverPhoto?.dateTimeOriginal || "").getFullYear()}
                </p>
              </div>

              <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
                <p className="text-xs text-text-muted">Photos</p>
                <p className="text-xs">{data.photos?.length}</p>
              </div>
            </div>
          </div>

          {/* IMAGES  */}
          <div className="w-full space-y-2">
            {data.photos?.map((photo) => (
              <Link
                href={`/p/${photo.id}`}
                key={photo.id}
                className="space-y-2"
              >
                <div className="flex items-center justify-center bg-gray-50 dark:bg-muted p-4 rounded-xl">
                  <FramedPhoto
                    src={photo.url}
                    alt={photo.title}
                    blurhash={photo.blurData!}
                    width={photo.width}
                    height={photo.height}
                  />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-center">
                    {photo.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {photo.dateTimeOriginal
                      ? format(photo.dateTimeOriginal, "d MMM yyyy")
                      : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {/* FOOTER  */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

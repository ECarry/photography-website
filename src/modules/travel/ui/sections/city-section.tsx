"use client";

import Footer from "@/app/(home)/_components/footer";
import BlurImage from "@/components/blur-image";
import FlipCard from "@/components/flip-card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import VectorCombined from "@/components/vector-combined";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  city: string;
}

export const CitySection = ({ city }: Props) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <CitySectionSuspense city={city} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CitySectionSuspense = ({ city }: Props) => {
  const router = useRouter();
  const [cityData] = trpc.photos.getCitySetByCity.useSuspenseQuery({ city });

  if (!cityData) {
    return null;
  }

  const decodedCityName = decodeURIComponent(city);

  const cityPhotos = cityData.photos.filter(
    (photo) => photo.id !== cityData.coverPhoto.id
  );

  return (
    <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      {/* LEFT CONTENT - Fixed */}
      <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
        <div className="w-full h-full relative">
          <BlurImage
            src={cityData.coverPhoto?.url || "/placeholder.svg"}
            alt={cityData.city}
            fill
            priority
            quality={75}
            blurhash={cityData.coverPhoto?.blurData || ""}
            sizes="75vw"
            onClick={() => router.push(`/photograph/${cityData.coverPhoto.id}`)}
            className="object-cover rounded-xl overflow-hidden cursor-pointer"
          />
          <div className="absolute right-0 bottom-0">
            <VectorCombined title={decodedCityName} position="bottom-right" />
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
                  <h1 className="text-4xl">{decodedCityName}</h1>
                </div>
              </div>

              <div>
                <p className="text-text-muted text-[15px]">
                  {cityData.description}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-1 2xl:col-span-1 flex flex-col gap-3">
            <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
              <p className="text-xs text-text-muted">Country</p>
              <p className="text-xs">{cityData.country}</p>
            </div>

            <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
              <p className="text-xs text-text-muted">City</p>
              <p className="text-xs">{cityData.city}</p>
            </div>

            <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
              <p className="text-xs text-text-muted">Year</p>
              <p className="text-xs">
                {new Date(
                  cityData.coverPhoto.dateTimeOriginal || ""
                ).getFullYear()}
              </p>
            </div>

            <div className="w-full h-full p-3 lg:p-5 bg-muted rounded-xl flex justify-between items-center">
              <p className="text-xs text-text-muted">Photos</p>
              <p className="text-xs">{cityData.photoCount}</p>
            </div>
          </div>
        </div>

        {/* IMAGES  */}
        {cityPhotos.map((photo) => (
          <AspectRatio
            ratio={photo.aspectRatio}
            key={photo.id}
            className="overflow-hidden rounded-lg"
          >
            <FlipCard
              id={photo.id}
              image={photo.url}
              title={photo.title || ""}
              location={photo.city + ", " + photo.country}
              camera={photo.make + " " + photo.model}
              blurData={photo.blurData}
              focalLength={photo.focalLength35mm}
              fNumber={photo.fNumber}
              exposureTime={photo.exposureTime}
              iso={photo.iso}
              rotate="y"
            />
          </AspectRatio>
        ))}
        {/* FOOTER  */}
        <Footer />
      </div>
    </div>
  );
};

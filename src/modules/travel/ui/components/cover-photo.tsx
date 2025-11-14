import BlurImage from "@/components/blur-image";
import { CitySetWithPhotos } from "@/db/schema";
import { keyToImage } from "@/lib/keyToImage";
import VectorCombined from "@/components/vector-combined";

interface CoverPhotoProps {
  citySet: CitySetWithPhotos;
  citySets: CitySetWithPhotos[];
}

export const CoverPhoto = ({ citySet, citySets }: CoverPhotoProps) => {
  return (
    <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
      <div className="w-full h-full relative rounded-xl overflow-hidden">
        {/* Cover photo */}
        <div className="relative w-full h-full">
          {citySets?.map((city) => (
            <div
              key={city.id}
              className={`absolute inset-0 transition-opacity duration-300 ${
                city.id === citySet.id ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <BlurImage
                src={keyToImage(city.coverPhoto.url)}
                alt={city.city}
                fill
                blurhash={city.coverPhoto.blurData}
                sizes="75vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="absolute right-0 bottom-0 z-10">
          <VectorCombined title={citySet?.city || ""} position="bottom-right" />
        </div>
      </div>
    </div>
  );
};

"use client";

import { useRouter } from "next/navigation";
import BlurImage from "@/components/blur-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type Photo } from "@/db/schema";
import VectorTopLeftAnimation from "./vector-top-left-animation";
import { keyToImage } from "@/lib/keyToImage";

interface Props {
  title: string;
  coverPhoto: Photo;
}

const CityCard = ({ title, coverPhoto }: Props) => {
  const router = useRouter();

  return (
    <div
      className="w-full relative group cursor-pointer"
      onClick={() => router.push(`/travel/${title}`)}
    >
      <AspectRatio
        ratio={0.75 / 1}
        className="overflow-hidden rounded-lg relative"
      >
        <BlurImage
          src={keyToImage(coverPhoto.url)}
          alt={coverPhoto.title}
          fill
          sizes="75vw"
          className="object-cover lg:group-hover:blur-xs lg:transition-[filter] lg:duration-300 lg:ease-out"
          blurhash={coverPhoto.blurData}
        />
      </AspectRatio>

      <div className="absolute top-0 left-0 z-20">
        <VectorTopLeftAnimation title={title} />
      </div>
    </div>
  );
};

export default CityCard;

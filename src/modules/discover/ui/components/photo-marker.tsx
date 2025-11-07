import BlurImage from "@/components/blur-image";
import { keyToImage } from "@/lib/keyToImage";
import type { PhotoPoint } from "@/modules/discover/lib/clustering";

interface PhotoMarkerProps {
  photo: PhotoPoint;
}

export const PhotoMarker = ({ photo }: PhotoMarkerProps) => (
  <div className="relative group cursor-pointer">
    {/* Container positioned so arrow tip is at coordinate center */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
      {/* Image above arrow */}
      <div className="w-20 h-20 rounded-2xl overflow-hidden border-[3px] border-white shadow-2xl hover:brightness-110 duration-150 transition-all relative mb-[-2px]">
        <BlurImage
          src={keyToImage(photo.url)}
          alt={photo.title}
          width={80}
          height={80}
          className="object-cover w-full h-full"
          blurhash={photo.blurData}
        />
      </div>
      {/* Arrow pointing down to coordinate center */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-white drop-shadow-lg" />
    </div>
  </div>
);

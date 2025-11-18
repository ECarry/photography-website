import BlurImage from "@/components/blur-image";
import { keyToImage } from "@/lib/keyToImage";
import type { Cluster } from "@/modules/discover/lib/clustering";

interface ClusterMarkerProps {
  cluster: Cluster;
  onClick?: () => void;
}

export const ClusterMarker = ({ cluster, onClick }: ClusterMarkerProps) => {
  // Use first photo as thumbnail
  const thumbnail = cluster.photos[0];

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Container positioned so arrow tip is at coordinate center */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Image above arrow */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-[3px] border-white shadow-2xl hover:brightness-110 duration-150 transition-all relative mb-[-2px]">
          <BlurImage
            src={keyToImage(thumbnail.url)}
            alt={`Cluster of ${cluster.count} photos`}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            blurhash={thumbnail.blurData}
          />
          {/* Bottom gradient overlay for better text visibility */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
          {/* Count badge in bottom-left corner */}
          <div className="absolute bottom-0.5 left-0.5 rounded-md px-2 py-0.5">
            <span className="text-white font-bold text-sm drop-shadow-md">
              {cluster.count}
            </span>
          </div>
        </div>
        {/* Arrow pointing down to coordinate center */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-white drop-shadow-lg" />
      </div>
    </div>
  );
};

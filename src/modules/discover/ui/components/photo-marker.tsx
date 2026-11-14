import { Image as ImageIcon } from "lucide-react";

interface PhotoMarkerProps {
  onClick?: () => void;
}

export const PhotoMarker = ({ onClick }: PhotoMarkerProps) => (
  <button
    type="button"
    aria-label="View photo details"
    className="relative block size-16 cursor-pointer p-0"
    onClick={onClick}
  >
    {/* Container positioned so arrow tip is at coordinate center */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
      <div className="mb-[-2px] grid size-16 place-items-center rounded-2xl border-[3px] border-white bg-background text-foreground shadow-2xl transition-all duration-150 hover:brightness-110">
        <ImageIcon aria-hidden="true" className="size-7" />
      </div>
      {/* Arrow pointing down to coordinate center */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-white drop-shadow-lg" />
    </div>
  </button>
);

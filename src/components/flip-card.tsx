import { cn } from "@/lib/utils";
import { FiCamera, FiMapPin } from "react-icons/fi";
import { Separator } from "./ui/separator";
import BlurImage from "./blur-image";
import { useState } from "react";

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  title: string;
  location: string;
  camera: string;
  blurData: string;
  rotate?: "x" | "y";
}

export default function FlipCard({
  image,
  title,
  location,
  camera,
  blurData,
  rotate = "y",
  className,
  ...props
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const rotationClass = {
    x: [
      isFlipped ? "[transform:rotateX(180deg)]" : "",
      "[transform:rotateX(180deg)]",
    ],
    y: [
      isFlipped ? "[transform:rotateY(180deg)]" : "",
      "[transform:rotateY(180deg)]",
    ],
  };
  const self = rotationClass[rotate];

  return (
    <div
      className={cn("size-full [perspective:1000px] cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
      {...props}
    >
      <div
        className={cn(
          "relative h-full transition-all duration-500 [transform-style:preserve-3d]",
          self[0]
        )}
      >
        {/* Front */}
        <div className="absolute h-full w-full [backface-visibility:hidden]">
          <BlurImage
            src={image}
            alt={title}
            fill
            blurhash={blurData}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Back */}
        <div
          className={cn(
            "absolute h-full w-full [backface-visibility:hidden]",
            self[1]
          )}
        >
          <div className="size-full relative">
            <BlurImage
              src={image}
              alt={title}
              fill
              blurhash={blurData}
              className="w-full h-full object-cover brightness-50"
            />

            <div className="absolute top-6 left-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl lg:text-3xl text-white">{title}</h1>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-white" size={14} />
                  <span className="text-white text-sm">{location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FiCamera className="text-white" size={14} />
                  <span className="text-white text-sm">{camera}</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-light">f/3.5</span>
                <Separator orientation="vertical" className="h-4 opacity-70" />
                <span className="text-white text-sm font-light">1/200</span>
                <Separator orientation="vertical" className="h-4 opacity-70" />
                <span className="text-white text-sm font-light">ISO100</span>
                <Separator orientation="vertical" className="h-4 opacity-70" />
                <span className="text-white text-sm font-light">45mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

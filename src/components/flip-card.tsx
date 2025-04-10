"use client";

import { cn, formatExposureTime } from "@/lib/utils";
import { FiCamera, FiMapPin } from "react-icons/fi";
import { Separator } from "./ui/separator";
import BlurImage from "./blur-image";
import { useState } from "react";
import { AiOutlineFullscreen } from "react-icons/ai";
import { useRouter } from "next/navigation";

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  image: string;
  title: string;
  location: string;
  camera: string;
  blurData: string;
  focalLength?: number | null;
  fNumber?: number | null;
  exposureTime?: number | null;
  iso?: number | null;
  rotate?: "x" | "y";
}

export default function FlipCard({
  id,
  image,
  title,
  location,
  camera,
  blurData,
  focalLength,
  fNumber,
  exposureTime,
  iso,
  rotate = "y",
  className,
  ...props
}: FlipCardProps) {
  const router = useRouter();
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
            sizes="75vw"
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
              sizes="75vw"
              className="w-full h-full object-cover brightness-50 scale-x-[-1]"
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
                  <span className="text-white text-xs">{camera}</span>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/photograph/${id}`);
                }}
                className="group"
              >
                <AiOutlineFullscreen
                  size={20}
                  className="text-white/70 group-hover:text-white group-hover:scale-125 transition-all duration-150 ease-[cubic-bezier(0.22, 1, 0.36, 1)]"
                />
              </button>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-2">
                {fNumber && (
                  <>
                    <span className="text-white text-xs lg:text-sm font-light">
                      ƒ/{fNumber}
                    </span>
                    <Separator orientation="vertical" className="h-4 opacity-70" />
                  </>
                )}
                {exposureTime && (
                  <>
                    <span className="text-white text-xs lg:text-sm font-light">
                      {formatExposureTime(exposureTime)}
                    </span>
                    <Separator orientation="vertical" className="h-4 opacity-70" />
                  </>
                )}
                {iso && (
                  <>
                    <span className="text-white text-xs lg:text-sm font-light">
                      ISO{iso}
                    </span>
                    <Separator orientation="vertical" className="h-4 opacity-70" />
                  </>
                )}
                {focalLength && (
                  <span className="text-white text-xs lg:text-sm font-light">
                    {focalLength}mm
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

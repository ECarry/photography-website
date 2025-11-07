"use client";

import { useState, memo } from "react";
import Image, { ImageProps } from "next/image";
import { Blurhash } from "react-blurhash";

interface BlurImageProps extends Omit<ImageProps, "onLoad"> {
  blurhash: string;
}

/**
 * BlurImage component displays an image with a blurhash placeholder.
 *
 * @param {string} src - The source of the image.
 * @param {string} alt - The alt text of the image.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {string} fill - The fill of the image.
 * @param {string} className - Optional className for the component.
 * @param {string} blurhash - The blurhash of the image.
 * @returns {JSX.Element} - The BlurImage component.
 */
const BlurImage = memo(function BlurImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  blurhash,
  ...props
}: BlurImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerStyle = fill ? "absolute inset-0" : "relative w-full h-full";

  return (
    <div className={containerStyle}>
      {!imageLoaded && (
        <div className={`absolute inset-0 ${className}`}>
          <Blurhash
            hash={blurhash}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${className} transition-opacity duration-500 ease-in-out ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        {...props}
      />
    </div>
  );
});

export default BlurImage;

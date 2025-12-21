"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Image, { ImageProps } from "next/image";
import { Blurhash } from "react-blurhash";

interface BlurImageProps
  extends Omit<ImageProps, "onLoad" | "onLoadingComplete" | "priority"> {
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
const BlurImageInner = function BlurImageInner({
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
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const containerStyle = fill ? "absolute inset-0" : "relative w-full h-full";

  useEffect(() => {
    if (!imageLoaded) return;

    const timeout = window.setTimeout(() => {
      setShowPlaceholder(false);
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [imageLoaded]);

  const showBlurhash = showPlaceholder && blurhash && blurhash.length >= 6;

  return (
    <div className={containerStyle}>
      {showBlurhash && (
        <div
          className={`absolute inset-0 ${
            className ?? ""
          } transition-opacity duration-500 ease-in-out ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
          style={{ pointerEvents: "none" }}
        >
          <Blurhash
            hash={blurhash}
            width="100%"
            height="100%"
            resolutionX={16}
            resolutionY={16}
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
        className={`${
          className ?? ""
        } transition-opacity duration-500 ease-in-out ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          window.requestAnimationFrame(() => {
            setImageLoaded(true);
          });
        }}
        onError={() => {
          setShowPlaceholder(false);
          setImageLoaded(true);
        }}
        {...props}
      />
    </div>
  );
};

const BlurImage = memo(function BlurImage(props: BlurImageProps) {
  const srcKey = useMemo(() => {
    const src = props.src;
    if (typeof src === "string") return src;

    if ("src" in src && typeof src.src === "string") {
      return src.src;
    }

    if ("default" in src && src.default && "src" in src.default) {
      return src.default.src;
    }

    return String(src);
  }, [props.src]);

  return <BlurImageInner key={srcKey} {...props} />;
});

export default BlurImage;

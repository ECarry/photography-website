"use client";

import { ReactNode, useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface CarouselProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  autoplayDelay?: number;
}

/**
 * Carousel component displays a carousel of images.
 *
 * @param {ReactNode} children - The children of the Carousel component.
 * @param {string} className - Optional className for the component.
 * @param {string} containerClassName - Optional className for the container.
 * @param {number} autoplayDelay - Optional autoplay delay in milliseconds.
 * @returns {JSX.Element} - The Carousel component.
 */
const Carousel = ({
  children,
  className = "",
  containerClassName = "",
  autoplayDelay = 6000,
}: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
      }),
    ]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={`overflow-hidden relative ${className}`} ref={emblaRef}>
      <div className={`flex ${containerClassName}`}>{children}</div>

      {/* Navigation Buttons */}
      <div className="hidden lg:flex absolute inset-y-0 left-0 right-0 items-center justify-between px-8 pointer-events-none">
        <button
          className="w-10 h-10 bg-black/15 backdrop-blur-sm flex items-center justify-center pointer-events-auto text-white rounded-md"
          onClick={() => emblaApi?.scrollPrev()}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          className="w-10 h-10 bg-black/15 backdrop-blur-sm flex items-center justify-center pointer-events-auto text-white rounded-md"
          onClick={() => emblaApi?.scrollNext()}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/15 backdrop-blur-sm px-3 py-1 rounded-full">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;

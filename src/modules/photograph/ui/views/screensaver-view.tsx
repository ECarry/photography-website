"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

interface GridCell {
  index: number;
  currentPhotoIndex: number;
  nextPhotoIndex: number;
  rotationDegree: number;
  isAnimating: boolean;
}

const CELL_SIZE = 300;
const FLIP_DURATION = 2000;
const FLIP_INTERVAL = 2000;

export const ScreensaverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });

  useEffect(() => {
    if (!data || data.length === 0 || typeof window === "undefined") return;

    const initializeGrid = () => {
      const cols = Math.ceil(window.innerWidth / CELL_SIZE);
      const rows = Math.ceil(window.innerHeight / CELL_SIZE);
      const totalCells = cols * rows;

      const cells: GridCell[] = Array.from({ length: totalCells }, (_, i) => ({
        index: i,
        currentPhotoIndex: Math.floor(Math.random() * data.length),
        nextPhotoIndex: Math.floor(Math.random() * data.length),
        rotationDegree: 0,
        isAnimating: false,
      }));

      setGridCells(cells);
      setGridSize({ cols, rows });
    };

    initializeGrid();

    // Re-initialize on window resize
    const handleResize = () => {
      initializeGrid();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  // Random flip animation
  const flipRandomCell = useCallback(() => {
    if (gridCells.length === 0 || !data) return;

    setGridCells((prev) => {
      const notAnimating = prev.filter((cell) => !cell.isAnimating);
      if (notAnimating.length === 0) return prev;

      const randomCell =
        notAnimating[Math.floor(Math.random() * notAnimating.length)];

      return prev.map((cell) => {
        if (cell.index !== randomCell.index) return cell;

        const isBackFaceHidden = (cell.rotationDegree / 180) % 2 === 0;

        return {
          ...cell,
          isAnimating: true,
          rotationDegree: cell.rotationDegree + 180,
          currentPhotoIndex: isBackFaceHidden
            ? cell.currentPhotoIndex
            : Math.floor(Math.random() * data.length),
          nextPhotoIndex: isBackFaceHidden
            ? Math.floor(Math.random() * data.length)
            : cell.nextPhotoIndex,
        };
      });
    });

    const timeoutId = setTimeout(() => {
      setGridCells((prev) =>
        prev.map((cell) =>
          cell.isAnimating
            ? {
                ...cell,
                isAnimating: false,
              }
            : cell
        )
      );
    }, FLIP_DURATION);

    return timeoutId;
  }, [data, gridCells.length]);

  useEffect(() => {
    if (gridCells.length === 0) return;

    const timeoutIds: NodeJS.Timeout[] = [];

    const interval = setInterval(() => {
      const timeoutId = flipRandomCell();
      if (timeoutId) timeoutIds.push(timeoutId);
    }, FLIP_INTERVAL);

    return () => {
      clearInterval(interval);
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [flipRandomCell, gridCells.length]);

  if (!data || gridCells.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="relative w-full h-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize.cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${gridSize.rows}, ${CELL_SIZE}px)`,
        }}
      >
        {gridCells.map((cell) => {
          const currentPhoto = data[cell.currentPhotoIndex];
          const nextPhoto = data[cell.nextPhotoIndex];

          return (
            <div
              key={cell.index}
              className="relative"
              style={{
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                perspective: "1000px",
              }}
            >
              <div
                className="relative w-full h-full transition-transform ease-in-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${cell.rotationDegree}deg)`,
                  transitionDuration: `${FLIP_DURATION}ms`,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                  }}
                >
                  <BlurImage
                    src={keyToUrl(currentPhoto.url)}
                    alt={currentPhoto.title}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    blurhash={currentPhoto.blurData}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <BlurImage
                    src={keyToUrl(nextPhoto.url)}
                    alt={nextPhoto.title}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    blurhash={nextPhoto.blurData}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

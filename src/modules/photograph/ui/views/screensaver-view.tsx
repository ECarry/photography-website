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

export const ScreensaverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  const [gridState] = useState(() => {
    if (!data || data.length === 0 || typeof window === "undefined") {
      return { cells: [], cols: 0, rows: 0 };
    }

    const cellSize = 250;
    const cols = Math.ceil(window.innerWidth / cellSize);
    const rows = Math.ceil(window.innerHeight / cellSize);
    const totalCells = cols * rows;

    const cells: GridCell[] = Array.from({ length: totalCells }, (_, i) => ({
      index: i,
      currentPhotoIndex: Math.floor(Math.random() * data.length),
      nextPhotoIndex: Math.floor(Math.random() * data.length),
      rotationDegree: 0,
      isAnimating: false,
    }));

    return { cells, cols, rows };
  });

  const [gridCells, setGridCells] = useState<GridCell[]>(gridState.cells);
  const gridSize = { cols: gridState.cols, rows: gridState.rows };

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

    setTimeout(() => {
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
    }, 1500);
  }, [gridCells.length, data]);

  useEffect(() => {
    if (gridCells.length === 0) return;

    const interval = setInterval(() => {
      flipRandomCell();
    }, 2000);

    return () => clearInterval(interval);
  }, [flipRandomCell, gridCells.length]);

  if (!data || gridCells.length === 0) return null;

  const cellSize = 250;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="relative w-full h-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize.rows}, ${cellSize}px)`,
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
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                perspective: "1000px",
              }}
            >
              <div
                className="relative w-full h-full transition-transform duration-1500 ease-in-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${cell.rotationDegree}deg)`,
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
                    width={cellSize}
                    height={cellSize}
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
                    width={cellSize}
                    height={cellSize}
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

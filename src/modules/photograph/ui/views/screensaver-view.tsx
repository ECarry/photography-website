"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { ScreensaverSettingsModal } from "@/modules/photograph/ui/components/screensaver-settings-modal";
import { Button } from "@/components/ui/button";
import { Settings, Maximize, Minimize } from "lucide-react";

interface GridCell {
  index: number;
  currentPhotoIndex: number;
  nextPhotoIndex: number;
  rotationDegree: number;
  isAnimating: boolean;
}

const FIXED_ROWS = 4;
const FLIP_DURATION = 2000;
const FLIP_INTERVAL = 2000;

export const ScreensaverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });
  const [cellSize, setCellSize] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rows, setRows] = useState(FIXED_ROWS);
  const [flipInterval, setFlipInterval] = useState(FLIP_INTERVAL);
  const [mouseTimeout, setMouseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!data || data.length === 0 || typeof window === "undefined") return;

    const initializeGrid = () => {
      // Fixed rows, calculate cell size based on screen height
      const calculatedCellSize = window.innerHeight / rows;
      setCellSize(calculatedCellSize);

      // Calculate cols - allow extra columns for horizontal overflow
      const cols = Math.ceil(window.innerWidth / calculatedCellSize) + 2;
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
  }, [data, rows]);

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
    }, flipInterval);

    return () => {
      clearInterval(interval);
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [flipRandomCell, gridCells.length, flipInterval]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);

      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }

      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      setMouseTimeout(timeout);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
    };
  }, [mouseTimeout]);

  const handleApply = (newRows: number, newFlipInterval: number) => {
    setRows(newRows);
    setFlipInterval(newFlipInterval);
    setShowModal(false);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!data || gridCells.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      {showControls && (
        <div className="fixed top-8 right-8 z-50 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowModal(true)}
            title="Settings"
          >
            <Settings />
          </Button>
        </div>
      )}

      <ScreensaverSettingsModal
        isOpen={showModal}
        rows={rows}
        flipInterval={flipInterval}
        onClose={() => setShowModal(false)}
        onApply={handleApply}
      />

      <div
        className="relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize.rows}, ${cellSize}px)`,
          height: "100vh",
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

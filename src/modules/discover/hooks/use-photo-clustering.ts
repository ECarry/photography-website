import { useMemo, useState, useCallback } from "react";
import {
  createClusterIndex,
  getClustersFromIndex,
  calculateBounds,
  type PhotoPoint,
} from "@/modules/discover/lib/clustering";

interface UsePhotoClusteringProps {
  photos: PhotoPoint[];
  initialZoom?: number;
}

export function usePhotoClustering({
  photos,
  initialZoom = 3,
}: UsePhotoClusteringProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [bounds, setBounds] = useState<[number, number, number, number]>([
    -180, -85, 180, 85,
  ]);

  // Filter valid photos (with coordinates)
  const validPhotos = useMemo(() => {
    return photos.filter(
      (photo) =>
        photo.latitude != null &&
        photo.longitude != null &&
        !isNaN(photo.latitude) &&
        !isNaN(photo.longitude)
    );
  }, [photos]);

  // Create cluster index
  const clusterIndex = useMemo(() => {
    if (validPhotos.length === 0) return null;
    return createClusterIndex(validPhotos);
  }, [validPhotos]);

  // Get clusters for current zoom and bounds
  const { clusters, singlePhotos } = useMemo(() => {
    if (!clusterIndex) return { clusters: [], singlePhotos: [] };

    const result = getClustersFromIndex(clusterIndex, zoom, bounds);

    return result;


  }, [clusterIndex, zoom, bounds, validPhotos.length]);

  // Handle map move/zoom changes
  const handleMove = useCallback(
    (viewState: { zoom: number; latitude: number; longitude: number }) => {

      setZoom(viewState.zoom);

      // Calculate approximate bounds based on viewport
      const newBounds = calculateBounds(
        viewState.latitude,
        viewState.longitude,
        viewState.zoom
      );
      setBounds(newBounds);
    },
    []
  );

  return {
    clusters,
    singlePhotos,
    zoom,
    handleMove,
  };
}

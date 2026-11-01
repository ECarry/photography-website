import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  createClusterIndex,
  getClustersFromIndex,
  type PhotoPoint,
} from "@/modules/discover/lib/clustering";
import type { DiscoverBounds } from "@/modules/discover/lib/viewport-bounds";

interface UsePhotoClusteringProps {
  photos: PhotoPoint[];
  bounds: DiscoverBounds | null;
  initialZoom?: number;
}

export function usePhotoClustering({
  photos,
  bounds,
  initialZoom = 3,
}: UsePhotoClusteringProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const pendingZoomRef = useRef(initialZoom);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!clusterIndex || !bounds) return { clusters: [], singlePhotos: [] };

    const result = getClustersFromIndex(clusterIndex, zoom, [
      bounds.west,
      bounds.south,
      bounds.east,
      bounds.north,
    ]);

    return result;
  }, [clusterIndex, zoom, bounds]);

  useEffect(
    () => () => {
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    },
    [],
  );

  // Limit reclustering while the map is moving; always process the latest zoom.
  const handleMove = useCallback(
    (viewState: { zoom: number; latitude: number; longitude: number }) => {
      pendingZoomRef.current = viewState.zoom;
      if (moveTimerRef.current) return;

      moveTimerRef.current = setTimeout(() => {
        moveTimerRef.current = null;
        setZoom(pendingZoomRef.current);
      }, 100);
    },
    [],
  );

  const getClusterPhotos = useCallback(
    (clusterId: number, limit = 48, offset = 0) =>
      clusterIndex
        ?.getLeaves(clusterId, limit, offset)
        .map((leaf) => leaf.properties as PhotoPoint) ?? [],
    [clusterIndex],
  );

  return {
    clusters,
    singlePhotos,
    zoom,
    handleMove,
    getClusterPhotos,
  };
}

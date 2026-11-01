import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
  const pendingViewRef = useRef<{
    zoom: number;
    latitude: number;
    longitude: number;
  } | null>(null);
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
    if (!clusterIndex) return { clusters: [], singlePhotos: [] };

    const result = getClustersFromIndex(clusterIndex, zoom, bounds);

    return result;
  }, [clusterIndex, zoom, bounds]);

  useEffect(
    () => () => {
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    },
    [],
  );

  // Limit reclustering while the map is moving; always process the latest view.
  const handleMove = useCallback(
    (viewState: { zoom: number; latitude: number; longitude: number }) => {
      pendingViewRef.current = viewState;
      if (moveTimerRef.current) return;

      moveTimerRef.current = setTimeout(() => {
        moveTimerRef.current = null;
        const latestView = pendingViewRef.current;
        if (!latestView) return;

        setZoom(latestView.zoom);
        setBounds(
          calculateBounds(
            latestView.latitude,
            latestView.longitude,
            latestView.zoom,
          ),
        );
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

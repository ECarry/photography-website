"use client";

import { useMemo } from "react";
import Mapbox from "@/modules/mapbox/ui/components/map";
import VectorCombined from "@/modules/home/ui/components/vector-combined";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePhotoClustering } from "@/modules/discover/hooks/use-photo-clustering";
import { PhotoMarker } from "@/modules/discover/ui/components/photo-marker";
import { ClusterMarker } from "@/modules/discover/ui/components/cluster-marker";
import { PhotoPopup } from "@/modules/discover/ui/components/photo-popup";

export const DiscoverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  // Use clustering hook
  const { clusters, singlePhotos, handleMove } = usePhotoClustering({
    photos: data,
    initialZoom: 3,
  });

  // Convert clusters and photos to map markers
  const markers = useMemo(() => {
    const result: Array<{
      id: string;
      longitude: number;
      latitude: number;
      popupContent?: React.ReactNode;
      element: React.ReactNode;
    }> = [];

    // Add cluster markers
    clusters.forEach((cluster) => {
      result.push({
        id: cluster.id,
        longitude: cluster.longitude,
        latitude: cluster.latitude,
        element: <ClusterMarker cluster={cluster} />,
      });
    });

    // Add single photo markers
    singlePhotos.forEach((photo) => {
      result.push({
        id: photo.id,
        longitude: photo.longitude!,
        latitude: photo.latitude!,
        popupContent: <PhotoPopup photo={photo} />,
        element: <PhotoMarker photo={photo} />,
      });
    });

    return result;
  }, [clusters, singlePhotos]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <div className="relative size-full">
        <Mapbox
          id="discoverMap"
          initialViewState={{
            longitude: 121.2816980216146,
            latitude: 31.31395498607465,
            zoom: 3,
          }}
          markers={markers}
          onMove={handleMove}
        />
      </div>
      <div className="absolute right-0 bottom-0 z-10">
        <VectorCombined title="Discover" position="bottom-right" />
      </div>
    </div>
  );
};

"use client";

import { useMemo, useState } from "react";
import Mapbox from "@/modules/mapbox/ui/components/map";
import VectorCombined from "@/components/vector-combined";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePhotoClustering } from "@/modules/discover/hooks/use-photo-clustering";
import { PhotoMarker } from "@/modules/discover/ui/components/photo-marker";
import { ClusterMarker } from "@/modules/discover/ui/components/cluster-marker";
import { PhotoPopup } from "@/modules/discover/ui/components/photo-popup";
import type { PhotoPoint } from "@/modules/discover/lib/clustering";
import { FramedPhoto } from "@/components/framed-photo";
import { format } from "date-fns/format";

export const DiscoverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  const [selectedPhotos, setSelectedPhotos] = useState<PhotoPoint[]>([]);

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
        element: (
          <ClusterMarker
            cluster={cluster}
            onClick={() => {
              if (cluster.photos.length) {
                setSelectedPhotos(cluster.photos);
              }
            }}
          />
        ),
      });
    });

    // Add single photo markers
    singlePhotos.forEach((photo) => {
      result.push({
        id: photo.id,
        longitude: photo.longitude!,
        latitude: photo.latitude!,
        popupContent: <PhotoPopup photo={photo} />,
        element: (
          <PhotoMarker
            photo={photo}
            onClick={() => {
              setSelectedPhotos([photo]);
            }}
          />
        ),
      });
    });

    return result;
  }, [clusters, singlePhotos]);

  const hasSelection = selectedPhotos.length > 0;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <div className="flex h-full gap-x-3">
        <div
          className="relative h-full rounded-xl overflow-hidden"
          style={{ width: hasSelection ? "50%" : "100%" }}
        >
          <Mapbox
            id="discoverMap"
            initialViewState={{
              longitude: 121.2816980216146,
              latitude: 31.31395498607465,
              zoom: 3,
            }}
            markers={markers}
            onMove={handleMove}
            onMapClick={() => {
              if (hasSelection) {
                setSelectedPhotos([]);
              }
            }}
          />
          <div className="absolute right-0 bottom-0 z-10">
            <VectorCombined title="Discover" position="bottom-right" />
          </div>
        </div>

        {hasSelection && (
          <div className="h-full bg-background flex flex-col w-1/2 rounded-xl">
            <div className="h-full p-4 overflow-y-auto bg-muted flex items-center justify-center rounded-xl">
              {selectedPhotos.length === 1 && (
                <div key={selectedPhotos[0].id} className="space-y-4">
                  <div className="space-y-4 flex items-center justify-center bg-gray-50 dark:bg-muted h-[80vh] p-10">
                    <FramedPhoto
                      src={selectedPhotos[0].url}
                      alt={selectedPhotos[0].title}
                      blurhash={selectedPhotos[0].blurData!}
                      width={selectedPhotos[0].width}
                      height={selectedPhotos[0].height}
                    />
                  </div>
                  <div className="flex flex-col w-full items-center justify-center">
                    <p className="text-sm font-medium">
                      {selectedPhotos[0].title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPhotos[0].dateTimeOriginal
                        ? format(
                            selectedPhotos[0].dateTimeOriginal,
                            "d MMM yyyy"
                          )
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {selectedPhotos.length > 1 && (
                <div className="w-full grid grid-cols-2 gap-1">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.id} className="space-y-4">
                      <div className="space-y-4 flex items-center justify-center bg-gray-50 dark:bg-muted h-[80vh] p-10">
                        <FramedPhoto
                          src={photo.url}
                          alt={photo.title}
                          blurhash={photo.blurData!}
                          width={photo.width}
                          height={photo.height}
                        />
                      </div>
                      <div className="flex flex-col w-full items-center justify-center">
                        <p className="text-sm font-medium">{photo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.dateTimeOriginal
                            ? format(photo.dateTimeOriginal, "d MMM yyyy")
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

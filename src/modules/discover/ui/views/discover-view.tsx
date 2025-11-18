"use client";

import { useCallback, useMemo, useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const DiscoverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  const isMobile = useIsMobile();
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoPoint[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Use clustering hook
  const { clusters, singlePhotos, handleMove } = usePhotoClustering({
    photos: data,
    initialZoom: 3,
  });

  const handleSelectPhotos = useCallback(
    (photos: PhotoPoint[]) => {
      setSelectedPhotos(photos);
      if (isMobile) {
        setIsDrawerOpen(true);
      }
    },
    [isMobile]
  );

  const clearSelection = () => {
    setSelectedPhotos([]);
    setIsDrawerOpen(false);
  };

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
                handleSelectPhotos(cluster.photos);
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
              handleSelectPhotos([photo]);
            }}
          />
        ),
      });
    });

    return result;
  }, [clusters, singlePhotos, handleSelectPhotos]);

  const hasSelection = selectedPhotos.length > 0;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <div className="flex h-full gap-x-3">
        <div
          className="relative h-full rounded-xl overflow-hidden"
          style={{ width: !isMobile && hasSelection ? "50%" : "100%" }}
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
                clearSelection();
              }
            }}
          />
          <div className="absolute right-0 bottom-0 z-10">
            <VectorCombined title="Discover" position="bottom-right" />
          </div>
        </div>

        {/* Desktop / tablet side panel */}
        {hasSelection && (
          <div className="hidden md:flex h-full bg-background flex-col w-1/2 rounded-xl">
            <div className="h-full p-4 overflow-y-auto bg-muted rounded-xl hide-scrollbar">
              {selectedPhotos.length && (
                <div className="w-full grid grid-cols-2 gap-x-1 gap-y-8">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-muted h-[80vh] p-10">
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

      {/* Mobile full-screen drawer */}
      {isMobile && (
        <Drawer
          open={isDrawerOpen && hasSelection}
          onOpenChange={(open) => {
            setIsDrawerOpen(open);
            if (!open) {
              setSelectedPhotos([]);
            }
          }}
        >
          <DrawerContent className="md:hidden inset-0 h-screen w-screen rounded-none">
            <div className="flex flex-col h-full">
              <DrawerHeader className="flex items-center justify-between">
                <DrawerTitle></DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 hide-scrollbar">
                {selectedPhotos.map((photo) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="flex items-center justify-center bg-gray-50 dark:bg-muted p-4 rounded-xl">
                      <FramedPhoto
                        src={photo.url}
                        alt={photo.title}
                        blurhash={photo.blurData!}
                        width={photo.width}
                        height={photo.height}
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-center">
                        {photo.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {photo.dateTimeOriginal
                          ? format(photo.dateTimeOriginal, "d MMM yyyy")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

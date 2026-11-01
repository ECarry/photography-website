"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import Mapbox from "@/modules/mapbox/ui/components/map";
import VectorCombined from "@/components/vector-combined";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePhotoClustering } from "@/modules/discover/hooks/use-photo-clustering";
import { PhotoMarker } from "@/modules/discover/ui/components/photo-marker";
import { ClusterMarker } from "@/modules/discover/ui/components/cluster-marker";
import { PhotoPopup } from "@/modules/discover/ui/components/photo-popup";
import type { PhotoPoint } from "@/modules/discover/lib/clustering";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapRef } from "react-map-gl/mapbox";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

const galleryDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const galleryFrames = {
  portrait: "/gallery-frames/black-matted-portrait.png",
  landscape: "/gallery-frames/black-matted-landscape.png",
};

const CLUSTER_PHOTO_PAGE_SIZE = 48;

function DiscoverPhotoGallery({
  photos,
  total,
  onLoadMore,
}: {
  photos: PhotoPoint[];
  total: number;
  onLoadMore: () => void;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-[1px] gap-y-6">
      {photos.map((photo) => {
        const aspectRatio =
          photo.width > 0 && photo.height > 0
            ? photo.width / photo.height
            : 1;
        const frameImage =
          aspectRatio < 1 ? galleryFrames.portrait : galleryFrames.landscape;
        const photoWindow =
          aspectRatio < 1
            ? {
                left: "22.25%",
                right: "22.25%",
                top: "8.25%",
                bottom: "8.125%",
              }
            : {
                left: "8.125%",
                right: "8.125%",
                top: "22.5%",
                bottom: "22.375%",
              };

        return (
          <Link
            href={`/p/${photo.id}`}
            key={photo.id}
            aria-label={`View ${photo.title || "photo"}`}
            className="group min-w-0"
          >
            <div className="relative aspect-square w-full bg-muted">
              <div className="absolute overflow-hidden" style={photoWindow}>
                <BlurImage
                  src={keyToUrl(photo.url)}
                  alt={photo.title || "Photo"}
                  fill
                  blurhash={photo.blurData || ""}
                  className="object-cover"
                  sizes="(max-width: 639px) 28vw, 18vw"
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${frameImage}")` }}
              />
            </div>
            <div className="mx-auto mt-1.5 max-w-[220px] px-1 text-center">
              <p className="line-clamp-1 text-xs font-medium text-[#292929] dark:text-[#FAFAFA]">
                {photo.title || "Untitled photograph"}
              </p>
              {photo.dateTimeOriginal && (
                <time
                  dateTime={photo.dateTimeOriginal.toISOString()}
                  className="mt-1 block text-[10px] text-[#8F8F8F]"
                >
                  {galleryDateFormatter.format(photo.dateTimeOriginal)}
                </time>
              )}
            </div>
          </Link>
        );
      })}
      {photos.length < total && (
        <div className="col-span-2 flex flex-col items-center gap-2 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {photos.length} of {total} photos
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            className="h-8"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

export const DiscoverLoading = () => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <div className="relative h-full rounded-xl overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiscoverView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.discover.getManyPhotos.queryOptions({})
  );

  const isMobile = useIsMobile();
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoPoint[]>([]);
  const [selectedPhotoTotal, setSelectedPhotoTotal] = useState(0);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const mapFocusPhotosRef = useRef<PhotoPoint[]>([]);
  const [selectionRevision, setSelectionRevision] = useState(0);

  // Resize map when selection changes (panel opens or closes)
  useEffect(() => {
    if (!mapRef.current || isMobile) return;

    // Trigger resize to ensure map knows its new container size
    // We wrap it in a setTimeout to allow the transition to start/finish or layout to update
    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      mapRef.current.resize();

      // Only fly to photos if there's a selection
      const photosToFocus = mapFocusPhotosRef.current;
      if (photosToFocus.length === 0) return;

      // Calculate center of selected photos
      const validPhotos = photosToFocus.filter(
        (p) => p.latitude != null && p.longitude != null
      );

      if (validPhotos.length === 0) return;

      if (validPhotos.length === 1) {
        const photo = validPhotos[0];
        mapRef.current.flyTo({
          center: [photo.longitude!, photo.latitude!],
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000,
        });
      } else {
        const longitudes = validPhotos.map((p) => p.longitude!);
        const latitudes = validPhotos.map((p) => p.latitude!);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);

        // Check if all points are the same
        if (minLng === maxLng && minLat === maxLat) {
          mapRef.current.flyTo({
            center: [minLng, minLat],
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 1000,
          });
        } else {
          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              duration: 1000,
              maxZoom: 10,
            }
          );
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectionRevision, isMobile]);

  // Use clustering hook
  const {
    clusters,
    singlePhotos,
    handleMove,
    getClusterPhotos,
  } = usePhotoClustering({ photos: data, initialZoom: 3 });

  const handleSelectPhotos = useCallback(
    (
      photos: PhotoPoint[],
      cluster?: { id: number; count: number },
    ) => {
      setSelectedPhotos(photos);
      mapFocusPhotosRef.current = photos;
      setSelectedClusterId(cluster?.id ?? null);
      setSelectedPhotoTotal(cluster?.count ?? photos.length);
      setSelectionRevision((revision) => revision + 1);
      if (isMobile) {
        setIsDrawerOpen(true);
      }
    },
    [isMobile]
  );

  const clearSelection = () => {
    setSelectedPhotos([]);
    mapFocusPhotosRef.current = [];
    setSelectedClusterId(null);
    setSelectedPhotoTotal(0);
    setSelectionRevision((revision) => revision + 1);
    setIsDrawerOpen(false);
  };

  const handleLoadMorePhotos = useCallback(() => {
    if (selectedClusterId === null) return;

    const nextPhotos = getClusterPhotos(
      selectedClusterId,
      CLUSTER_PHOTO_PAGE_SIZE,
      selectedPhotos.length,
    );
    if (nextPhotos.length === 0) return;

    setSelectedPhotos((current) => [...current, ...nextPhotos]);
  }, [getClusterPhotos, selectedClusterId, selectedPhotos.length]);

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
              const photos = getClusterPhotos(
                cluster.clusterId,
                CLUSTER_PHOTO_PAGE_SIZE,
              );
              if (photos.length > 0) {
                handleSelectPhotos(photos, {
                  id: cluster.clusterId,
                  count: cluster.count,
                });
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
  }, [clusters, singlePhotos, handleSelectPhotos, getClusterPhotos]);

  const hasSelection = selectedPhotoTotal > 0;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <div className="flex h-full gap-x-3">
        <div
          className="relative h-full rounded-xl overflow-hidden"
          style={{ width: !isMobile && hasSelection ? "50%" : "100%" }}
        >
          <Mapbox
            ref={mapRef}
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
            <div className="h-full p-4 overflow-y-auto bg-background rounded-xl hide-scrollbar">
              <DiscoverPhotoGallery
                photos={selectedPhotos}
                total={selectedPhotoTotal}
                onLoadMore={handleLoadMorePhotos}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile full-screen drawer */}
      {isMobile && (
        <Drawer
          open={isDrawerOpen && hasSelection}
          onOpenChange={(open) => {
            if (open) {
              setIsDrawerOpen(true);
            } else {
              clearSelection();
            }
          }}
        >
          <DrawerContent className="md:hidden inset-0 h-screen w-screen rounded-none">
            <div className="flex flex-col h-full">
              <DrawerHeader className="flex items-center justify-between">
                <DrawerTitle>
                  Selected photos · {selectedPhotoTotal}
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 hide-scrollbar">
                <DiscoverPhotoGallery
                  photos={selectedPhotos}
                  total={selectedPhotoTotal}
                  onLoadMore={handleLoadMorePhotos}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

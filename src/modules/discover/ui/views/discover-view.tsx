"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import Mapbox from "@/modules/mapbox/ui/components/map";
import VectorCombined from "@/components/vector-combined";
import { useTRPC } from "@/trpc/client";
import { X } from "lucide-react";
import {
  keepPreviousData,
  skipToken,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePhotoClustering } from "@/modules/discover/hooks/use-photo-clustering";
import { PhotoMarker } from "@/modules/discover/ui/components/photo-marker";
import { ClusterMarker } from "@/modules/discover/ui/components/cluster-marker";
import type { PhotoPoint } from "@/modules/discover/lib/clustering";
import type { DiscoverPhotoDetails } from "@/modules/discover/types";
import { DISCOVER_DETAILS_PAGE_SIZE } from "@/modules/discover/lib/photo-payload";
import {
  expandViewportBounds,
  type DiscoverBounds,
} from "@/modules/discover/lib/viewport-bounds";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapRef } from "react-map-gl/mapbox";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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

function DiscoverPhotoGallery({
  photos,
  total,
  isLoading,
  hasError,
  onRetry,
  onLoadMore,
}: {
  photos: DiscoverPhotoDetails[];
  total: number;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-3 gap-y-7">
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
      {isLoading && (
        <p
          role="status"
          className="col-span-2 py-3 text-center text-xs text-muted-foreground"
        >
          Loading photo details...
        </p>
      )}
      {hasError && (
        <div className="col-span-2 flex flex-col items-center gap-2 py-3">
          <p role="alert" className="text-xs text-muted-foreground">
            Could not load photo details.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      {!isLoading && !hasError && photos.length < total && (
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
  const queryClient = useQueryClient();
  const [viewportBounds, setViewportBounds] =
    useState<DiscoverBounds | null>(null);
  const { data: photoResponse } = useQuery(
    trpc.discover.getManyPhotos.queryOptions(
      viewportBounds ? { bounds: viewportBounds } : skipToken,
      {
        staleTime: 30_000,
        gcTime: 60_000,
        placeholderData: keepPreviousData,
        throwOnError: true,
      },
    ),
  );
  const photoData = photoResponse?.photos ?? [];
  const hasMoreMapPhotos = photoResponse?.hasMore ?? false;

  const isMobile = useIsMobile();
  const [selectedPhotos, setSelectedPhotos] =
    useState<DiscoverPhotoDetails[]>([]);
  const [selectedPhotoPoints, setSelectedPhotoPoints] = useState<PhotoPoint[]>(
    [],
  );
  const [isLoadingPhotoDetails, setIsLoadingPhotoDetails] = useState(false);
  const [photoDetailsError, setPhotoDetailsError] = useState(false);
  const [selectedPhotoTotal, setSelectedPhotoTotal] = useState(0);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const mapFocusPhotosRef = useRef<PhotoPoint[]>([]);
  const selectedClusterPageLoaderRef = useRef<
    ((clusterId: number, limit?: number, offset?: number) => PhotoPoint[]) | null
  >(null);
  const selectedPhotoRequestRef = useRef(0);
  const pendingPhotoPageRef = useRef<{
    points: PhotoPoint[];
    append: boolean;
  } | null>(null);
  const [selectionRevision, setSelectionRevision] = useState(0);

  const updateViewportBounds = useCallback(() => {
    const mapBounds = mapRef.current?.getBounds();
    if (!mapBounds) return;

    const nextBounds = expandViewportBounds({
      west: mapBounds.getWest(),
      south: mapBounds.getSouth(),
      east: mapBounds.getEast(),
      north: mapBounds.getNorth(),
    });

    setViewportBounds((current) => {
      if (
        current &&
        current.west === nextBounds.west &&
        current.south === nextBounds.south &&
        current.east === nextBounds.east &&
        current.north === nextBounds.north
      ) {
        return current;
      }
      return nextBounds;
    });
  }, []);

  // Resize map when selection changes (panel opens or closes)
  useEffect(() => {
    if (!mapRef.current || isMobile) return;

    // Trigger resize to ensure map knows its new container size
    // We wrap it in a setTimeout to allow the transition to start/finish or layout to update
    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      mapRef.current.resize();
      updateViewportBounds();

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
  }, [selectionRevision, isMobile, updateViewportBounds]);

  // Use clustering hook
  const {
    clusters,
    singlePhotos,
    handleMove,
    getClusterPhotos,
  } = usePhotoClustering({
    photos: photoData,
    bounds: viewportBounds,
    initialZoom: 3,
  });

  const loadPhotoDetails = useCallback(
    async (
      points: PhotoPoint[],
      requestId: number,
      append: boolean,
    ) => {
      if (points.length === 0) return;

      pendingPhotoPageRef.current = { points, append };
      setIsLoadingPhotoDetails(true);
      setPhotoDetailsError(false);

      try {
        const details = await queryClient.fetchQuery(
          trpc.discover.getPhotosByIds.queryOptions({
            ids: points.map((point) => point.id),
          }),
        );
        if (requestId !== selectedPhotoRequestRef.current) return;

        const detailsById = new Map(
          details.map((photo) => [photo.id, photo]),
        );
        const loadedPhotos = points.flatMap((point) => {
          const photo = detailsById.get(point.id);
          return photo ? [photo] : [];
        });

        setSelectedPhotoPoints((current) =>
          append ? [...current, ...points] : points,
        );
        setSelectedPhotos((current) =>
          append ? [...current, ...loadedPhotos] : loadedPhotos,
        );
        pendingPhotoPageRef.current = null;
      } catch {
        if (requestId === selectedPhotoRequestRef.current) {
          setPhotoDetailsError(true);
        }
      } finally {
        if (requestId === selectedPhotoRequestRef.current) {
          setIsLoadingPhotoDetails(false);
        }
      }
    },
    [queryClient, trpc],
  );

  const handleSelectPhotos = useCallback(
    (
      photos: PhotoPoint[],
      cluster?: {
        id: number;
        count: number;
        getPage: (
          clusterId: number,
          limit?: number,
          offset?: number,
        ) => PhotoPoint[];
      },
    ) => {
      const requestId = ++selectedPhotoRequestRef.current;
      pendingPhotoPageRef.current = null;
      setSelectedPhotoPoints([]);
      setSelectedPhotos([]);
      setPhotoDetailsError(false);
      mapFocusPhotosRef.current = photos;
      setSelectedClusterId(cluster?.id ?? null);
      setSelectedPhotoTotal(cluster?.count ?? photos.length);
      selectedClusterPageLoaderRef.current = cluster?.getPage ?? null;
      setSelectionRevision((revision) => revision + 1);
      void loadPhotoDetails(photos, requestId, false);
      if (isMobile) {
        setIsDrawerOpen(true);
      }
    },
    [isMobile, loadPhotoDetails],
  );

  const clearSelection = () => {
    selectedPhotoRequestRef.current += 1;
    pendingPhotoPageRef.current = null;
    setSelectedPhotoPoints([]);
    setSelectedPhotos([]);
    setIsLoadingPhotoDetails(false);
    setPhotoDetailsError(false);
    mapFocusPhotosRef.current = [];
    setSelectedClusterId(null);
    setSelectedPhotoTotal(0);
    selectedClusterPageLoaderRef.current = null;
    setSelectionRevision((revision) => revision + 1);
    setIsDrawerOpen(false);
  };

  const handleLoadMorePhotos = useCallback(() => {
    if (
      selectedClusterId === null ||
      !selectedClusterPageLoaderRef.current ||
      isLoadingPhotoDetails ||
      photoDetailsError
    ) {
      return;
    }

    const nextPoints = selectedClusterPageLoaderRef.current(
      selectedClusterId,
      DISCOVER_DETAILS_PAGE_SIZE,
      selectedPhotoPoints.length,
    );
    if (nextPoints.length === 0) return;

    void loadPhotoDetails(
      nextPoints,
      selectedPhotoRequestRef.current,
      true,
    );
  }, [
    selectedClusterId,
    selectedPhotoPoints.length,
    isLoadingPhotoDetails,
    photoDetailsError,
    loadPhotoDetails,
  ]);

  const handleRetryPhotoDetails = useCallback(() => {
    const pendingPage = pendingPhotoPageRef.current;
    if (!pendingPage) return;
    void loadPhotoDetails(
      pendingPage.points,
      selectedPhotoRequestRef.current,
      pendingPage.append,
    );
  }, [loadPhotoDetails]);

  // Convert clusters and photos to map markers
  const markers = useMemo(() => {
    const result: Array<{
      id: string;
      longitude: number;
      latitude: number;
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
              const points = getClusterPhotos(
                cluster.clusterId,
                DISCOVER_DETAILS_PAGE_SIZE,
              );
              if (points.length > 0) {
                handleSelectPhotos(points, {
                  id: cluster.clusterId,
                  count: cluster.count,
                  getPage: getClusterPhotos,
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
  const selectionSummary =
    selectedPhotos.length < selectedPhotoTotal
      ? `Showing ${selectedPhotos.length} of ${selectedPhotoTotal} photos`
      : `${selectedPhotoTotal} ${selectedPhotoTotal === 1 ? "photo" : "photos"}`;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <div className="flex h-full gap-x-3">
        <div
          className="relative h-full rounded-xl overflow-hidden"
          style={{ width: !isMobile && hasSelection ? "50%" : "100%" }}
        >
          {hasMoreMapPhotos && (
            <div
              role="status"
              className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1.5 text-center text-xs text-muted-foreground shadow-sm backdrop-blur"
            >
              Showing up to 500 photos. Zoom in to narrow the area.
            </div>
          )}
          <Mapbox
            ref={mapRef}
            id="discoverMap"
            initialViewState={{
              longitude: 121.2816980216146,
              latitude: 31.31395498607465,
              zoom: 3,
            }}
            markers={markers}
            onLoad={updateViewportBounds}
            onMove={handleMove}
            onMoveEnd={updateViewportBounds}
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
          <div className="hidden h-full w-1/2 flex-col overflow-hidden rounded-xl bg-background md:flex">
            <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-foreground">
                  Photos in this area
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectionSummary}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clearSelection}
                aria-label="Clear photo selection"
                title="Clear selection"
              >
                <X className="size-4" />
              </Button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-background px-5 pb-5 hide-scrollbar">
              <DiscoverPhotoGallery
                photos={selectedPhotos}
                total={selectedPhotoTotal}
                isLoading={isLoadingPhotoDetails}
                hasError={photoDetailsError}
                onRetry={handleRetryPhotoDetails}
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
              <DrawerHeader className="flex flex-row items-center justify-between gap-4 text-left">
                <div className="min-w-0 text-left">
                  <DrawerTitle>Photos in this area</DrawerTitle>
                  <DrawerDescription>{selectionSummary}</DrawerDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearSelection}
                  aria-label="Clear photo selection"
                  title="Clear selection"
                >
                  <X className="size-4" />
                </Button>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 hide-scrollbar">
                <DiscoverPhotoGallery
                  photos={selectedPhotos}
                  total={selectedPhotoTotal}
                  isLoading={isLoadingPhotoDetails}
                  hasError={photoDetailsError}
                  onRetry={handleRetryPhotoDetails}
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

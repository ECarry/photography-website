"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Mapbox from "@/modules/mapbox/ui/components/map";
import { useTRPC } from "@/trpc/client";
import type { MapRef } from "react-map-gl/mapbox";

const numberFormatter = new Intl.NumberFormat("en-US");

interface RankingDragState {
  pointerId: number;
  pointerType: string;
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
  startedOnList: boolean;
  gestureMode: "pending" | "map" | "list";
}

export function MapView() {
  const trpc = useTRPC();
  const mapRef = useRef<MapRef | null>(null);
  const rankingDragRef = useRef<RankingDragState | null>(null);
  const rankingListRef = useRef<HTMLOListElement | null>(null);
  const { data } = useSuspenseQuery(
    trpc.dashboard.getVisitedCountriesWithGeoJson.queryOptions(),
  );
  const countries = data.countries;
  const maxPhotoCount = countries[0]?.photoCount ?? 0;
  const totalPhotos = countries.reduce(
    (total, country) => total + country.photoCount,
    0,
  );

  const handleRankingPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const startedOnList =
      event.target instanceof Element &&
      Boolean(event.target.closest("[data-ranking-scroll]"));

    rankingDragRef.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      lastX: event.clientX,
      lastY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      startedOnList,
      gestureMode: "pending",
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleRankingPointerMove = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const drag = rankingDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    const totalX = event.clientX - drag.startX;
    const totalY = event.clientY - drag.startY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    if (Math.hypot(totalX, totalY) < 4) return;

    if (drag.gestureMode === "pending") {
      drag.gestureMode =
        drag.pointerType === "touch" &&
        drag.startedOnList &&
        Math.abs(totalY) >= Math.abs(totalX)
          ? "list"
          : "map";
    }

    if (drag.gestureMode === "list") {
      if (rankingListRef.current) {
        rankingListRef.current.scrollTop -= deltaY;
      }
      return;
    }

    mapRef.current?.panBy([-deltaX, -deltaY], { duration: 0 });
  };

  const handleRankingPointerEnd = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const drag = rankingDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    rankingDragRef.current = null;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl border-0 bg-white py-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
      <CardHeader className="grid-cols-[1fr_auto] px-5 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
          Travel footprint
        </CardTitle>
        <CardDescription className="text-xs text-[#8F8F8F]">
          Your collection by country
        </CardDescription>
        <div className="col-start-2 row-span-2 row-start-1 text-right">
          <p className="text-[20px] font-semibold leading-6 tracking-[-0.6px] tabular-nums text-[#171717] dark:text-[#FAFAFA]">
            {numberFormatter.format(countries.length)}
          </p>
          <p className="mt-1 text-xs text-[#8F8F8F]">countries</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-5 sm:pb-5">
        <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-lg bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] sm:min-h-[360px] dark:bg-[#262626]">
          <div className="absolute inset-0">
            <Mapbox
              ref={mapRef}
              id="dashboardMap"
              showControls={false}
              scrollZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              dragRotate={false}
              initialViewState={{
                longitude: 0,
                latitude: 20,
                zoom: 0,
              }}
              geoJsonData={data.geoJson}
            />
          </div>

          {countries.length > 0 ? (
            <section
              aria-label="Countries ranked by photos"
                className="absolute inset-x-3 bottom-3 z-10 flex max-h-[235px] select-none flex-col touch-none rounded-lg bg-transparent p-4 cursor-grab active:cursor-grabbing sm:inset-y-4 sm:left-auto sm:right-4 sm:max-h-none sm:w-[320px] sm:p-5"
              onPointerDown={handleRankingPointerDown}
              onPointerMove={handleRankingPointerMove}
              onPointerUp={handleRankingPointerEnd}
              onPointerCancel={handleRankingPointerEnd}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                  Most photographed
                </h3>
                <span className="shrink-0 text-right text-xs tabular-nums text-[#8F8F8F]">
                  {numberFormatter.format(totalPhotos)} photos
                </span>
              </div>
              <ol
                ref={rankingListRef}
                data-ranking-scroll
                className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2"
              >
                {countries.map((country, index) => (
                  <li
                    key={`${country.countryCode}-${country.country}`}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate text-[#171717] dark:text-[#FAFAFA]">
                        <span className="mr-2 font-mono text-[#8F8F8F]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {country.country || country.countryCode}
                      </span>
                      <span className="shrink-0 tabular-nums text-[#4D4D4D] dark:text-[#B3B3B3]">
                        {numberFormatter.format(country.photoCount)}
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="h-1 overflow-hidden rounded-full bg-[#F2F2F2] dark:bg-[#303030]"
                    >
                      <div
                        className="h-full rounded-full bg-[#171717] dark:bg-[#FAFAFA]"
                        style={{
                          width: `${maxPhotoCount
                            ? (country.photoCount / maxPhotoCount) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <p className="absolute inset-x-3 bottom-3 z-10 rounded-lg bg-white/95 p-4 text-sm text-[#4D4D4D] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:bg-[#171717]/95 dark:text-[#B3B3B3] sm:inset-x-auto sm:left-4 sm:max-w-sm">
              Add location data to your photos to see your travel footprint.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

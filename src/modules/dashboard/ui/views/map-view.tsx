"use client";

import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import Mapbox from "@/modules/mapbox/ui/components/map";
import { useTRPC } from "@/trpc/client";
import { siteConfig } from "@/site.config";

const numberFormatter = new Intl.NumberFormat("en-US");
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 0,
});

export function MapView() {
  const trpc = useTRPC();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useSuspenseQuery(
    trpc.dashboard.getVisitedCountriesWithGeoJson.queryOptions(),
  );
  const countries = [...data.countries].sort(
    (first, second) => second.photoCount - first.photoCount,
  );
  const mapFillStart = isDark ? "#1B2A1E" : "#E4F0E5";
  const mapFillEnd = isDark ? "#4D9559" : "#287A3C";

  return (
    <section
      aria-labelledby="dashboard-countries-title"
      className={`@container/countries flex h-full min-w-0 flex-col overflow-hidden rounded-xl border shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${
        isDark
          ? "border-[#202020] bg-[#080808] text-[#FAFAFA]"
          : "border-[#E5E5E5] bg-white text-[#171717]"
      }`}
    >
      <header
        className={`flex h-14 shrink-0 items-center justify-between border-b px-5 ${
          isDark ? "border-[#202020]" : "border-[#E5E5E5]"
        }`}
      >
        <h2
          id="dashboard-countries-title"
          className="text-[14px] font-semibold tracking-[-0.28px]"
        >
          Countries
        </h2>
        <span className={isDark ? "text-xs text-white/45" : "text-xs text-[#8F8F8F]"}>
          {numberFormatter.format(countries.length)} countries
        </span>
      </header>

      <div className="grid flex-1 grid-cols-1 @xl/countries:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
        <div
          className={`relative h-[300px] overflow-hidden @xl/countries:h-[410px] ${
            isDark ? "bg-[#070907]" : "bg-[#F2F4F2]"
          }`}
        >
          <div className="absolute inset-0">
            <Mapbox
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
              mapStyleUrl={
                isDark
                  ? siteConfig.mapbox.darkStyle
                  : siteConfig.mapbox.lightStyle
              }
              geoJsonFillPaint={{
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "photoRatio"],
                  0,
                  mapFillStart,
                  100,
                  mapFillEnd,
                ] as const,
                "fill-opacity": 0.9,
              }}
              geoJsonLinePaint={{
                "line-color": isDark ? "#0b0b0b" : "#ffffff",
                "line-width": 0.7,
                "line-opacity": 0.9,
              }}
            />
          </div>
          {countries.length === 0 && (
            <div
              className={`absolute inset-x-4 bottom-4 rounded-md border px-3 py-2 text-xs ${
                isDark
                  ? "border-white/10 bg-black/80 text-white/70"
                  : "border-black/10 bg-white/90 text-[#4D4D4D]"
              }`}
            >
              Add country metadata to your photos to see them on the map.
            </div>
          )}
        </div>

        <aside
          className={`h-[320px] min-w-0 overflow-y-auto border-t p-3 @xl/countries:h-[410px] @xl/countries:border-l @xl/countries:border-t-0 ${
            isDark
              ? "border-[#202020] bg-[#050505]"
              : "border-[#E5E5E5] bg-white"
          }`}
        >
          {countries.length > 0 ? (
            <ol className="space-y-2">
              {countries.map((country) => (
                <li
                  key={`${country.countryCode}-${country.country}`}
                  className={`relative flex h-9 items-center overflow-hidden rounded-md px-3 ${
                    isDark ? "bg-[#111111]" : "bg-[#F4F4F4]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 ${
                      isDark ? "bg-[#202820]" : "bg-[#E4EEE5]"
                    }`}
                    style={{ width: `${country.photoRatio}%` }}
                  />
                  <span className="relative z-10 min-w-0 flex-1 truncate text-xs font-medium">
                    {country.country || country.countryCode}
                  </span>
                  <span
                    className={`relative z-10 shrink-0 text-right text-xs tabular-nums ${
                      isDark ? "text-white/55" : "text-[#737373]"
                    }`}
                  >
                    {compactNumberFormatter.format(country.photoCount)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p
              className={`px-2 py-3 text-xs ${
                isDark ? "text-white/45" : "text-[#8F8F8F]"
              }`}
            >
              No country data yet.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

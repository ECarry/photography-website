"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Mapbox from "@/modules/mapbox/ui/components/map";
import { useTRPC } from "@/trpc/client";

const numberFormatter = new Intl.NumberFormat("en-US");

export function MapView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.dashboard.getVisitedCountriesWithGeoJson.queryOptions(),
  );
  const countries = data.countries;
  const maxPhotoCount = countries[0]?.photoCount ?? 0;
  const totalPhotos = countries.reduce(
    (total, country) => total + country.photoCount,
    0,
  );

  return (
    <Card className="rounded-xl border-0 bg-white py-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
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
      <CardContent className="grid gap-5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div className="h-[220px] overflow-hidden rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
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
          />
        </div>

        {countries.length > 0 ? (
          <section aria-label="Countries ranked by photos" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-[-0.24px] text-[#4D4D4D] dark:text-[#B3B3B3]">
                Most photographed
              </h3>
              <span className="text-xs tabular-nums text-[#8F8F8F]">
                {numberFormatter.format(totalPhotos)} photos
              </span>
            </div>
            <ol className="h-[148px] space-y-3 overflow-y-auto pr-2">
              {countries.map((country, index) => (
                <li key={`${country.countryCode}-${country.country}`} className="space-y-1.5">
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
          <p className="py-3 text-sm text-[#8F8F8F]">
            Add location data to your photos to see your travel footprint.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

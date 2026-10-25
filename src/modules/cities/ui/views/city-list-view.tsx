"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { CityCard } from "../components/city-card";

export function CityListView() {
  const trpc = useTRPC();
  const { data: cities } = useSuspenseQuery(trpc.city.getMany.queryOptions());
  const [search, setSearch] = useState("");

  const filteredCities = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return cities;
    return cities.filter((citySet) =>
      [citySet.city, citySet.country, citySet.description]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(term)),
    );
  }, [cities, search]);

  const photoCount = cities.reduce((total, citySet) => total + citySet.photoCount, 0);

  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 md:px-6 md:py-8 xl:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
              TRAVEL COLLECTION
            </p>
            <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
              Cities
            </h1>
            <p className="mt-1 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
              Places gathered from your photographs.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="font-semibold tabular-nums text-[#171717] dark:text-[#FAFAFA]">
                {cities.length.toLocaleString()}
              </p>
              <p className="text-xs text-[#8F8F8F]">cities</p>
            </div>
            <div>
              <p className="font-semibold tabular-nums text-[#171717] dark:text-[#FAFAFA]">
                {photoCount.toLocaleString()}
              </p>
              <p className="text-xs text-[#8F8F8F]">photos</p>
            </div>
          </div>
        </header>

        {cities.length > 0 && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-[320px]">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8F8F8F]"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cities"
                aria-label="Search cities"
                className="h-10 border-0 bg-white pl-9 text-[14px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 dark:bg-[#171717]"
              />
            </label>
            <p className="text-xs text-[#8F8F8F]">
              Showing {filteredCities.length} of {cities.length} cities
            </p>
          </div>
        )}

        {cities.length === 0 ? (
          <div className="mt-8 flex min-h-[280px] flex-col items-center justify-center rounded-xl bg-white px-6 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
            <MapPin aria-hidden="true" className="size-8 text-[#8F8F8F]" />
            <h2 className="mt-4 text-[16px] font-medium text-[#171717] dark:text-[#FAFAFA]">
              No cities yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-[#8F8F8F]">
              Photos with location data will appear in your city collection.
            </p>
            <Button
              asChild
              variant="ghost"
              className="mt-4 text-[#0072F5] hover:bg-[#EBEBEB] hover:text-[#005FCC]"
            >
              <Link href="/dashboard/photos">Open photo library</Link>
            </Button>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white px-6 py-12 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
            <h2 className="text-[14px] font-medium text-[#171717] dark:text-[#FAFAFA]">
              No matching cities
            </h2>
            <p className="mt-1 text-sm text-[#8F8F8F]">
              Try a different city or country name.
            </p>
            <Button
              variant="ghost"
              className="mt-3 text-[#0072F5] hover:bg-[#EBEBEB] hover:text-[#005FCC]"
              onClick={() => setSearch("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <section
            aria-label="City collections"
            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredCities.map((citySet) => (
              <CityCard key={citySet.id} citySet={citySet} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export function CityListLoadingView() {
  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 md:px-6 md:py-8 xl:px-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-10 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function CityListErrorView() {
  return (
    <div className="mx-auto flex min-h-[320px] max-w-[1400px] items-center justify-center px-4 text-center">
      <div>
        <p className="text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
          Could not load cities
        </p>
        <p className="mt-1 text-sm text-[#8F8F8F]">
          Please refresh the page and try again.
        </p>
      </div>
    </div>
  );
}

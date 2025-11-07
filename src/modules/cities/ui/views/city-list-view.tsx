"use client";

import { useTRPC } from "@/trpc/client";
import { CityCard } from "../components/city-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

export function CityListView() {
  const trpc = useTRPC();
  const { data: cities } = useSuspenseQuery(trpc.city.getMany.queryOptions());

  if (!cities || cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4 md:px-8">
        <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No cities yet</h3>
        <p className="text-muted-foreground">
          Upload photos with location data to see your city collection
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 md:px-8">
      {cities.map((citySet) => (
        <CityCard key={citySet.id} citySet={citySet} />
      ))}
    </div>
  );
}

export function CityListLoadingView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 md:px-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CityListErrorView() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4 md:px-8">
      <p className="text-destructive mb-2">Failed to load cities</p>
      <p className="text-sm text-muted-foreground">
        Please try refreshing the page
      </p>
    </div>
  );
}

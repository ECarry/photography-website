"use client";

import { useState, useEffect } from "react";
import Footer from "@/modules/home/ui/components/footer";
import { CoverPhoto } from "../components/cover-photo";
import { Introduction } from "../components/introduction";
import { CityItem } from "../components/city-item";
import { CitySetWithPhotos } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export const TravelView = () => {
  const trpc = useTRPC();
  const [activeCity, setActiveCity] = useState<CitySetWithPhotos | null>(null);

  const { data } = useSuspenseQuery(trpc.travel.getCitySets.queryOptions({}));

  useEffect(() => {
    if (!activeCity && data && data.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCity(data[0]);
    }
  }, [activeCity, data]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <CoverPhoto citySet={activeCity || data[0]} citySets={data} />

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <div className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
        <Introduction />
        <div className="space-y-3">
          {data.map((city) => (
            <CityItem key={city.id} city={city} onMouseEnter={setActiveCity} />
          ))}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export const LoadingStatus = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <Skeleton />

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <div className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
        <Introduction />
        <div className="space-y-3">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
        <Footer />
      </div>
    </div>
  );
};

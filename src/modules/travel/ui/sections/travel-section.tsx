"use client";

import { useState, useEffect, Suspense } from "react";
import Footer from "@/app/(home)/_components/footer";
import {
  PageTransitionContainer,
  PageTransitionItem,
} from "@/components/page-transition";
import { CoverPhoto } from "../components/cover-photo";
import { Introduction } from "../components/introduction";
import { CityItem } from "../components/city-item";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { CitySet } from "@/db/schema/photos";

export const TravelSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <TravelSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const TravelSectionSuspense = () => {
  const [activeCity, setActiveCity] = useState<CitySet | null>(null);

  const [data] = trpc.photos.getCitySetsTest.useSuspenseQuery();

  useEffect(() => {
    if (!activeCity && data && data.length > 0) {
      setActiveCity(data[0]);
    }
  }, [activeCity, data]);

  return (
    <>
      <CoverPhoto citySet={activeCity || data[0]} />

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <PageTransitionContainer className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
        <PageTransitionItem>
          <Introduction />
        </PageTransitionItem>

        <div className="space-y-3">
          {data.map((city) => (
            <PageTransitionItem key={city.id}>
              <CityItem city={city} onMouseEnter={setActiveCity} />
            </PageTransitionItem>
          ))}
        </div>

        <PageTransitionItem>
          <Footer />
        </PageTransitionItem>
      </PageTransitionContainer>
    </>
  );
};

import { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import {
  getTravelCityPath,
  getTravelCitySetId,
} from "@/modules/travel/city-url";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CityView } from "@/modules/travel/ui/views/city-view";

type Props = {
  params: Promise<{ city: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: routeSegment } = await params;
  const citySetId = getTravelCitySetId(routeSegment);

  if (!citySetId) {
    return {
      title: routeSegment,
      robots: { index: false, follow: false },
    };
  }

  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.travel.getOne.queryOptions({ citySetId }),
  );

  return {
    title: `${data.city}, ${data.country}`,
    description:
      data.description ||
      `Explore travel photography from ${data.city}, ${data.country}.`,
  };
}

export default async function TravelCityPage({ params }: Props) {
  const { city: routeSegment } = await params;
  const queryClient = getQueryClient();

  const citySetId = getTravelCitySetId(routeSegment);
  if (citySetId) {
    const data = await queryClient.fetchQuery(
      trpc.travel.getOne.queryOptions({ citySetId }),
    );
    const canonicalPath = getTravelCityPath(data.id, data.city);
    if (canonicalPath !== `/travel/${encodeURIComponent(routeSegment)}`) {
      permanentRedirect(canonicalPath);
    }

    await queryClient.prefetchQuery(
      trpc.travel.getOne.queryOptions({ citySetId }),
    );
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <Suspense fallback={<p>Loading...</p>}>
            <CityView citySetId={citySetId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    );
  }

  const resolution = await queryClient.fetchQuery(
    trpc.travel.resolveLegacyCity.queryOptions({ city: routeSegment }),
  );

  if (resolution.status === "not-found") notFound();
  if (resolution.status === "ambiguous") redirect("/travel");

  permanentRedirect(
    getTravelCityPath(resolution.citySetId, resolution.city),
  );
}

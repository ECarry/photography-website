import { Suspense } from "react";
import type { Metadata } from "next";
import { ErrorBoundary } from "react-error-boundary";
import { DiscoverWidget } from "@/modules/discover/ui/components/discover-widget";
import { createSocialMetadata } from "@/lib/seo";

const description =
  "Explore public photography on an interactive map and discover images from cities and places around the world.";

export const metadata: Metadata = {
  title: "Discover",
  description,
  ...createSocialMetadata({
    title: "Discover",
    description,
    path: "/discover",
    image: "/bg.jpg",
  }),
};

const page = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <ErrorBoundary fallback={<p>Error</p>}>
      <DiscoverWidget />
    </ErrorBoundary>
  </Suspense>
);

export default page;

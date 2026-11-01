import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DiscoverWidget } from "@/modules/discover/ui/components/discover-widget";

export const metadata = {
  title: "Discover",
  description:
    "Explore photos on an interactive map. Discover stunning photography from cities and locations around the world.",
};

const page = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <ErrorBoundary fallback={<p>Error</p>}>
      <DiscoverWidget />
    </ErrorBoundary>
  </Suspense>
);

export default page;

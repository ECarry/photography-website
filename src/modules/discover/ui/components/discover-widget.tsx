"use client";

import dynamic from "next/dynamic";

const DiscoverLoading = () => (
  <div className="h-full w-full animate-pulse rounded-xl bg-muted" />
);

export const DiscoverWidget = dynamic(
  () =>
    import("@/modules/discover/ui/views/discover-view").then(
      (mod) => mod.DiscoverView,
    ),
  { ssr: false, loading: () => <DiscoverLoading /> },
);

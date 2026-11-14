import { Metadata } from "next";
import { getQueryClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { RetryErrorBoundary } from "@/components/retry-error-boundary";
import {
  createSocialMetadata,
  getAbsoluteSiteUrl,
  getPublicImageUrl,
  toSeoDescription,
} from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/site.config";
import {
  LoadingState,
  PhotographView,
} from "@/modules/photograph/ui/views/photograph-view";

type Props = {
  params: Promise<{ id: string }>;
};

// ISR: revalidated on demand via the "photos" cache tag, hourly as backup.
export const revalidate = 3600;

// Enable on-demand static generation without prerendering paths at build time.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.home.getPhotoById.queryOptions({ id })
  );
  const description = toSeoDescription(
    data.description,
    `A photograph from Sera's travel and city photography collection.`,
  );

  return {
    title: data.title,
    description,
    alternates: { canonical: `/p/${id}` },
    ...createSocialMetadata({
      title: data.title,
      description,
      path: `/p/${id}`,
      image: data.url,
    }),
  };
}

const page = async ({ params }: Props) => {
  const id = (await params).id;
  const queryClient = getQueryClient();
  const photo = await queryClient.fetchQuery(
    trpc.home.getPhotoById.queryOptions({ id }),
  );
  const description = toSeoDescription(
    photo.description,
    `A photograph from ${siteConfig.name}'s travel and city photography collection.`,
  );
  const canonicalUrl = getAbsoluteSiteUrl(`/p/${id}`);
  const imageUrl = getPublicImageUrl(photo.url);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: photo.title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    creator: {
      "@type": "Person",
      name: siteConfig.name,
    },
    width: Math.round(photo.width),
    height: Math.round(photo.height),
    ...(imageUrl
      ? {
          contentUrl: getAbsoluteSiteUrl(imageUrl),
          thumbnailUrl: getAbsoluteSiteUrl(imageUrl),
        }
      : {}),
    ...(photo.dateTimeOriginal
      ? { dateCreated: photo.dateTimeOriginal.toISOString() }
      : {}),
    ...(photo.createdAt
      ? { uploadDate: photo.createdAt.toISOString() }
      : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingState />}>
          <RetryErrorBoundary>
            <PhotographView id={id} />
          </RetryErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default page;

import { Metadata } from "next";
import { BlogSlugView } from "@/modules/blog/ui/views/blog-slug-view";
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
import { siteConfig } from "@/site.config";
import { JsonLd } from "@/components/json-ld";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: generated on demand, cached, regenerated in the background at most
// hourly. Publishing/editing a post triggers on-demand revalidation.
export const revalidate = 3600;

// Enable on-demand static generation without prerendering paths at build time.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  // Decode URL-encoded params
  const decodedSlug = decodeURIComponent(slug);
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.blog.getOne.queryOptions({ slug: decodedSlug })
  );
  const description = toSeoDescription(
    data.description || data.content,
    `A story from ${siteConfig.name}'s photography journal.`,
  );
  const canonical = `/blog/${encodeURIComponent(decodedSlug)}`;

  return {
    title: data.title,
    description,
    alternates: { canonical },
    ...createSocialMetadata({
      type: "article",
      title: data.title,
      description,
      path: canonical,
      image: data.coverImage,
    }),
  };
}

export default async function page({ params }: Props) {
  const slug = (await params).slug;
  // Decode URL-encoded params
  const decodedSlug = decodeURIComponent(slug);
  const queryClient = getQueryClient();
  const post = await queryClient.fetchQuery(
    trpc.blog.getOne.queryOptions({ slug: decodedSlug })
  );
  const description = toSeoDescription(
    post.description || post.content,
    `A story from ${siteConfig.name}'s photography journal.`,
  );
  const canonicalUrl = getAbsoluteSiteUrl(
    `/blog/${encodeURIComponent(decodedSlug)}`,
  );
  const coverImage = getPublicImageUrl(post.coverImage);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: siteConfig.name,
    },
    image: [getAbsoluteSiteUrl(coverImage ?? "/bg.jpg")],
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>
          <RetryErrorBoundary>
            <BlogSlugView slug={decodedSlug} />
          </RetryErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}

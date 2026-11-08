import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

type SocialMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
};

export function getPublicImageUrl(source?: string | null) {
  if (!source) return undefined;
  if (/^(https?:)?\/\//i.test(source) || source.startsWith("/")) return source;

  const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  if (!publicBaseUrl) return undefined;

  return `${publicBaseUrl.replace(/\/+$/, "")}/${source.replace(/^\/+/, "")}`;
}

export function getAbsoluteSiteUrl(path: string) {
  return new URL(
    path,
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ).toString();
}

export function createSocialMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: SocialMetadataOptions): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = getPublicImageUrl(image) ?? "/bg.jpg";

  return {
    openGraph: {
      type,
      siteName: siteConfig.name,
      title,
      description,
      url: path,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function toSeoDescription(
  source: string | null | undefined,
  fallback: string,
  maxLength = 160,
) {
  const text = (source ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return fallback;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

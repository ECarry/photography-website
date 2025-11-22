"use client";

// External dependencies
import Image from "next/image";
import Link from "next/link";
// UI Components
import { Badge } from "@/components/ui/badge";
import { postsGetMany } from "@/modules/blog/types";
import { keyToImage } from "@/lib/keyToImage";

interface LatestPostSectionProps {
  data?: postsGetMany[0];
}

export const LatestPostSection = ({ data }: LatestPostSectionProps) => {
  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl">
        <p className="text-muted-foreground">No blog available</p>
      </div>
    );
  }

  return (
    <Link
      href={`/blog/${data.slug}`}
      className="block w-full h-full relative rounded-xl overflow-hidden group cursor-pointer"
    >
      <Image
        src={keyToImage(data.coverImage) || "/placeholder.svg"}
        alt={data.title || "Blog post"}
        fill
        unoptimized
        priority
        className="object-cover group-hover:blur-xs transition-[filter] duration-300 ease-out"
      />

      <div className="absolute w-full bottom-0 p-3">
        <div className="bg-background backdrop-blur-xs p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge>
              <span className="text-xs font-light">New</span>
            </Badge>
            <h2 className="font-light">{data.title}</h2>
          </div>

          <div className="relative mr-2">
            <span className="text-sm font-light">Read</span>
            <div className="absolute bottom-[2px] left-0 w-full h-px bg-black dark:bg-white transition-all duration-300 transform ease-in-out group-hover:w-1/3"></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

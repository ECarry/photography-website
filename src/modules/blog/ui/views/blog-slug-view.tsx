"use client";

import VectorCombined from "@/components/vector-combined";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDownIcon } from "lucide-react";
import Image from "next/image";
import { PostPreview } from "../components/post-preview";
import ContactCard from "@/components/contact-card";
import Footer from "@/components/footer";
import { keyToImage } from "@/lib/keyToImage";

export const BlogSlugView = ({ slug }: { slug: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.blog.getOne.queryOptions({ slug }));

  return (
    <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      {/* LEFT CONTENT - Fixed */}
      <div className="w-full h-[50vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 md:h-[80vh] lg:h-screen p-0 lg:p-3 group">
        <div className="block w-full h-full relative rounded-xl overflow-hidden">
          <Image
            src={keyToImage(data.coverImage) || "/placeholder.svg"}
            alt="Image"
            fill
            quality={75}
            className="object-cover"
          />

          <div className="absolute right-0 bottom-0">
            <VectorCombined title="Tag" position="bottom-right" />
          </div>
        </div>
      </div>

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <div className="w-full lg:w-1/2 space-y-3 pb-3">
        {/* CONTENT  */}
        <div className="bg-muted rounded-xl p-10 md:p-12 md:h-[calc(100vh-24px)] flex flex-col">
          <div className="mb-10">
            <span className="bg-muted-hover rounded-sm py-1 px-2 text-xs text-text-muted font-light">
              March 2024
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <h1 className="text-4xl">{data.title}</h1>
            <h2 className="font-light">{data.description}</h2>

            <div className="mt-8">
              <button className="bg-background hover:bg-muted duration-150 transition-all flex items-center gap-1 py-[10px] pr-3 pl-[14px] rounded-lg">
                <span className="text-sm font-light">Read Article</span>{" "}
                <ArrowDownIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-muted rounded-xl p-5 w-full flex justify-between">
            <p className="text-text-muted">Category</p>
            <p>{data.tags}</p>
          </div>

          <div className="bg-muted rounded-xl p-5 w-full flex justify-between">
            <p className="text-text-muted">Reading Time</p>
            <p>{data.readingTimeMinutes} Min</p>
          </div>

          <div className="bg-muted rounded-xl p-5 w-full flex justify-between">
            <p className="text-text-muted">Date</p>
            <p>March 2024</p>
          </div>
        </div>

        {/* POST PREVIEW */}
        <div className="px-3">
          <PostPreview content={data.content} />
        </div>

        {/* CONTACT CARD  */}
        <ContactCard
          title="Contact me"
          href="mailto:lianshiliang93@gmail.com"
          className="bg-primary text-white hover:text-black dark:text-black dark:hover:text-white h-14"
        />

        {/* FOOTER  */}
        <Footer />
      </div>
    </div>
  );
};

"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE } from "@/constants";
import { usePostsFilters } from "../../hooks/use-posts-filters";
import { PostsSearchFilter } from "./posts-search-filter";

export function PostsListHeader() {
  const [filters, setFilters] = usePostsFilters();
  const hasSearch = Boolean(filters.search);

  return (
    <header className="mx-auto flex w-full max-w-[1400px] flex-col px-4 py-7 md:px-6 md:py-8 xl:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
            JOURNAL
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
            Stories
          </h1>
          <p className="mt-1 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
            Write and publish the stories behind your photographs.
          </p>
        </div>
        <Button
          asChild
          className="h-10 w-full rounded-md bg-[#0072F5] px-4 text-sm font-medium text-white shadow-none hover:bg-[#005FCC] focus-visible:ring-2 focus-visible:ring-[#0072F5] focus-visible:ring-offset-2 sm:w-auto"
        >
          <Link href="/dashboard/posts/new">
            <Plus className="size-4" />
            New story
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <PostsSearchFilter />
        {hasSearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ search: "", page: DEFAULT_PAGE })}
            className="h-9 rounded-md px-2 text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
          >
            <X className="size-4" />
            Clear search
          </Button>
        )}
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, XCircle } from "lucide-react";
import { usePostsFilters } from "../../hooks/use-posts-filters";
import { DEFAULT_PAGE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PostsSearchFilter } from "./posts-search-filter";
import { PostForm } from "./post-form-bak";
import { ResponsiveModal } from "@/components/responsive-modal";

export const PostsListHeader = () => {
  const [filters, setFilters] = usePostsFilters();
  const [open, setOpen] = useState(false);

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={setOpen} title="Add Post">
        <PostForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </ResponsiveModal>
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground ">
            Here&apos;s a list of your posts
          </p>
        </div>
        <div className="flex items-center justify-between">
          <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
              <PostsSearchFilter />
              {isAnyFilterModified && (
                <Button onClick={onClearFilters} variant="outline" size="sm">
                  <XCircle />
                  Clear
                </Button>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon />
            New Post
          </Button>
        </div>
      </div>
    </>
  );
};

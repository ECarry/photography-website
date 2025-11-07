"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { usePhotosFilters } from "../../hooks/use-photos-filters";
import { DEFAULT_PAGE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PhotosSearchFilter } from "./photos-search-filter";
import { useModal } from "@/hooks/use-modal";

export const PhotosListHeader = () => {
  const modal = useModal();
  const [filters, setFilters] = usePhotosFilters();

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-muted-foreground ">
            Here&apos;s a list of your photos
          </p>
        </div>

        <div className="flex items-center justify-between">
          <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
              <PhotosSearchFilter />
              {isAnyFilterModified && (
                <Button onClick={onClearFilters} variant="outline" size="sm">
                  <XCircle />
                  Clear
                </Button>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Button variant="default" onClick={modal.onOpen}>
            Add Photo
          </Button>
        </div>
      </div>
    </>
  );
};

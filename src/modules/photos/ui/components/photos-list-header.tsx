"use client";

import { Button } from "@/components/ui/button";
import { XCircle, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { usePhotosFilters } from "../../hooks/use-photos-filters";
import { DEFAULT_PAGE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PhotosSearchFilter } from "./photos-search-filter";
import { useModal } from "@/hooks/use-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {filters.orderBy === "desc" ? (
                      <>
                        <ArrowDownIcon className="h-4 w-4" />
                        Newest First
                      </>
                    ) : (
                      <>
                        <ArrowUpIcon className="h-4 w-4" />
                        Oldest First
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => setFilters({ orderBy: "desc" })}
                  >
                    <ArrowDownIcon className="mr-2 h-4 w-4" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters({ orderBy: "asc" })}
                  >
                    <ArrowUpIcon className="mr-2 h-4 w-4" />
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

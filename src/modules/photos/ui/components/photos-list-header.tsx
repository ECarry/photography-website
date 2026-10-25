"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE } from "@/constants";
import { useModal } from "@/hooks/use-modal";
import { usePhotosFilters } from "../../hooks/use-photos-filters";
import { PhotosSearchFilter } from "./photos-search-filter";

export function PhotosListHeader() {
  const modal = useModal();
  const [filters, setFilters] = usePhotosFilters();

  const hasModifiedFilters =
    Boolean(filters.search) ||
    Boolean(filters.city) ||
    filters.visibility !== "all" ||
    filters.favorite !== "all" ||
    filters.orderBy !== "desc";

  const updateFilter = (values: Partial<typeof filters>) =>
    setFilters({ ...values, page: DEFAULT_PAGE });

  const clearFilters = () =>
    setFilters({
      search: "",
      city: "",
      visibility: "all",
      favorite: "all",
      orderBy: "desc",
      page: DEFAULT_PAGE,
    });

  return (
    <header className="mx-auto flex w-full max-w-[1400px] flex-col px-4 py-7 md:px-6 md:py-8 xl:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
            COLLECTION
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
            Photos
          </h1>
          <p className="mt-1 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
            Manage your images, details, and visibility.
          </p>
        </div>
        <Button
          type="button"
          onClick={modal.onOpen}
          className="h-10 w-full rounded-md bg-[#0072F5] px-4 text-sm font-medium text-white shadow-none hover:bg-[#005FCC] focus-visible:ring-2 focus-visible:ring-[#0072F5] focus-visible:ring-offset-2 sm:w-auto"
        >
          <Plus className="size-4" />
          Add photo
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <PhotosSearchFilter />
        <Input
          aria-label="Filter by city"
          placeholder="City"
          value={filters.city}
          className="h-9 w-[120px] border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#005FCC] dark:bg-[#171717]"
          onChange={(event) => updateFilter({ city: event.target.value })}
        />
        <Select
          value={filters.visibility}
          onValueChange={(visibility: typeof filters.visibility) =>
            updateFilter({ visibility })
          }
        >
          <SelectTrigger className="h-9 w-[136px] border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.favorite}
          onValueChange={(favorite: typeof filters.favorite) =>
            updateFilter({ favorite })
          }
        >
          <SelectTrigger className="h-9 w-[136px] border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any favorite</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
            <SelectItem value="not-favorites">Not favorites</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.orderBy}
          onValueChange={(orderBy: typeof filters.orderBy) =>
            updateFilter({ orderBy })
          }
        >
          <SelectTrigger className="h-9 w-[142px] border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
            {filters.orderBy === "desc" ? (
              <ArrowDown className="size-4" />
            ) : (
              <ArrowUp className="size-4" />
            )}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        {hasModifiedFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 rounded-md px-2 text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </header>
  );
}

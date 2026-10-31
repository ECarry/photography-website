"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  Heart,
  MapPin,
  Plus,
  X,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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

      <section
        aria-label="Photo filters"
        className="mt-6 rounded-xl bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-4"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
          <PhotosSearchFilter />
          <div className="relative min-w-0">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8F8F8F]" />
            <Input
              aria-label="Filter by city or region"
              placeholder="City or region"
              value={filters.city}
              className="h-9 w-full border-0 bg-[#FAFAFA] pl-9 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#005FCC] dark:bg-[#0A0A0A]"
              onChange={(event) => updateFilter({ city: event.target.value })}
            />
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Select
            value={filters.visibility}
            onValueChange={(visibility: typeof filters.visibility) =>
              updateFilter({ visibility })
            }
          >
            <SelectTrigger
              aria-label="Filter by visibility"
              className={cn(
                "h-9 w-full border-0 bg-[#FAFAFA] text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#0A0A0A] sm:w-[156px]",
                filters.visibility !== "all" &&
                  "shadow-[0_0_0_1px_rgba(0,114,245,0.45)]",
              )}
            >
              <Eye
                className={cn(
                  "size-4",
                  filters.visibility !== "all" && "text-[#0072F5]",
                )}
              />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any visibility</SelectItem>
              <SelectItem value="public">Public only</SelectItem>
              <SelectItem value="private">Private only</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.favorite}
            onValueChange={(favorite: typeof filters.favorite) =>
              updateFilter({ favorite })
            }
          >
            <SelectTrigger
              aria-label="Filter by favorite status"
              className={cn(
                "h-9 w-full border-0 bg-[#FAFAFA] text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#0A0A0A] sm:w-[156px]",
                filters.favorite !== "all" &&
                  "shadow-[0_0_0_1px_rgba(0,114,245,0.45)]",
              )}
            >
              <Heart
                className={cn(
                  "size-4",
                  filters.favorite === "favorites" && "fill-current text-[#0072F5]",
                  filters.favorite === "not-favorites" && "text-[#0072F5]",
                )}
              />
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
            <SelectTrigger
              aria-label="Sort photos"
              className="h-9 w-full border-0 bg-[#FAFAFA] text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#0A0A0A] sm:w-[156px]"
            >
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
              className="col-span-2 h-9 justify-center rounded-md px-3 text-xs text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA] sm:ml-auto sm:w-auto"
            >
              <X className="size-4" />
              Reset filters
            </Button>
          )}
        </div>
      </section>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { DashboardPhotoCard } from "../components/dashboard-photo-card";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { DataPagination } from "@/components/data-pagination";
import { usePhotosFilters } from "../../hooks/use-photos-filters";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageOff, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useErrorBoundary } from "react-error-boundary";
import { useModal } from "@/hooks/use-modal";
import { DEFAULT_PAGE } from "@/constants";
import { toast } from "sonner";

export const DashboardPhotosView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = usePhotosFilters();
  const [selection, setSelection] = useState<{
    filterKey: string;
    rows: RowSelectionState;
  }>({ filterKey: "", rows: {} });
  const bulkUpdate = useMutation(trpc.photos.bulkUpdate.mutationOptions());
  const removePhoto = useMutation(trpc.photos.remove.mutationOptions());
  const updatePhoto = useMutation(trpc.photos.update.mutationOptions());
  const { data } = useSuspenseQuery(
    trpc.photos.getMany.queryOptions({ ...filters })
  );

  const filterKey = JSON.stringify([
    filters.city,
    filters.favorite,
    filters.orderBy,
    filters.page,
    filters.search,
    filters.visibility,
  ]);
  const rowSelection =
    selection.filterKey === filterKey ? selection.rows : {};
  const selectedOnPage = data.items.filter(
    (photo) => rowSelection[photo.id],
  ).length;
  const allOnPageSelected =
    data.items.length > 0 && selectedOnPage === data.items.length;
  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  useEffect(() => {
    const lastAvailablePage = Math.max(DEFAULT_PAGE, data.totalPages);
    if (filters.page > lastAvailablePage) {
      setFilters({ page: lastAvailablePage });
    }
  }, [data.totalPages, filters.page, setFilters]);

  const handleRowSelectionChange = (
    updater:
      | RowSelectionState
      | ((previous: RowSelectionState) => RowSelectionState),
  ) => {
    setSelection({
      filterKey,
      rows: typeof updater === "function" ? updater(rowSelection) : updater,
    });
  };
  const refreshPhotoQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries(trpc.photos.getMany.queryOptions({})),
      queryClient.invalidateQueries(
        trpc.home.getManyLikePhotos.queryOptions({ limit: 10 }),
      ),
      queryClient.invalidateQueries(
        trpc.home.getCitySets.queryOptions({ limit: 9 }),
      ),
      queryClient.invalidateQueries(trpc.city.getMany.queryOptions()),
      queryClient.invalidateQueries(
        trpc.dashboard.getDashboardStats.queryOptions(),
      ),
      queryClient.invalidateQueries(
        trpc.dashboard.getRecentPhotos.queryOptions(),
      ),
      queryClient.invalidateQueries(
        trpc.dashboard.getPhotoMetadataSummary.queryOptions(),
      ),
    ]);
  };

  const handlePhotoUpdate = async (
    id: string,
    values: { visibility?: "public" | "private"; isFavorite?: boolean },
  ) => {
    try {
      await updatePhoto.mutateAsync({ id, ...values });
      await refreshPhotoQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo update failed");
    }
  };

  const handleBulkUpdate = async (
    values: { visibility?: "public" | "private"; isFavorite?: boolean },
  ) => {
    try {
      const result = await bulkUpdate.mutateAsync({
        ids: selectedIds,
        ...values,
      });
      await refreshPhotoQueries();
      setSelection({ filterKey, rows: {} });
      toast.success(`Updated ${result.updatedCount} photos`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk update failed");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Permanently delete ${selectedIds.length} selected photos?`,
      )
    ) {
      return;
    }

    const results = await Promise.allSettled(
      selectedIds.map((id) => removePhoto.mutateAsync({ id })),
    );
    const deletedCount = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failedCount = results.length - deletedCount;

    await refreshPhotoQueries();
    setSelection({ filterKey, rows: {} });
    if (deletedCount > 0) toast.success(`Deleted ${deletedCount} photos`);
    if (failedCount > 0) toast.error(`Could not delete ${failedCount} photos`);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.visibility !== "all" ||
      filters.favorite !== "all" ||
      filters.city ||
      filters.orderBy !== "desc",
  );

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6 xl:px-8">
      {data.items.length === 0 ? (
        <EmptyStatus
          showUpload={!hasActiveFilters}
          onClear={() =>
            setFilters({
              search: "",
              visibility: "all",
              favorite: "all",
              city: "",
              orderBy: "desc",
              page: DEFAULT_PAGE,
            })
          }
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                aria-label="Select all photos on this page"
                checked={
                  allOnPageSelected
                    ? true
                    : selectedOnPage > 0
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(checked) =>
                  handleRowSelectionChange(
                    checked
                      ? Object.fromEntries(
                          data.items.map((photo) => [photo.id, true]),
                        )
                      : {},
                  )
                }
              />
              <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                Photo library
              </h2>
            </div>
            <p className="text-xs tabular-nums text-[#8F8F8F]">
              {data.total.toLocaleString()} results
            </p>
          </div>
          {selectedIds.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
              <span className="mr-2 text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                {selectedIds.length} selected
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ visibility: "public" })}
                className="text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
              >
                Make public
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ visibility: "private" })}
                className="text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
              >
                Make private
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ isFavorite: true })}
                className="text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
              >
                Favorite
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ isFavorite: false })}
                className="text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
              >
                Unfavorite
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={removePhoto.isPending}
                onClick={handleBulkDelete}
                className="text-[#E5484D] hover:bg-[#FEF2F2] hover:text-[#B4232A] dark:hover:bg-[#351B1D]"
              >
                Delete
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {data.items.map((photo) => (
              <DashboardPhotoCard
                key={photo.id}
                photo={photo}
                selected={Boolean(rowSelection[photo.id])}
                isUpdating={updatePhoto.isPending}
                onSelect={(selected) =>
                  handleRowSelectionChange((previous) => ({
                    ...previous,
                    [photo.id]: selected,
                  }))
                }
                onToggleVisibility={() =>
                  handlePhotoUpdate(photo.id, {
                    visibility:
                      photo.visibility === "public" ? "private" : "public",
                  })
                }
              />
            ))}
          </div>
          <DataPagination
            page={filters.page}
            totalPages={data.totalPages}
            onPageChange={(page) => {
              setFilters({ page });
            }}
          />
        </>
      )}
    </main>
  );
};

const EmptyStatus = ({
  showUpload,
  onClear,
}: {
  showUpload: boolean;
  onClear: () => void;
}) => {
  const modal = useModal();

  return (
    <Empty className="min-h-[280px] rounded-xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageOff />
        </EmptyMedia>
        <EmptyTitle>
          {showUpload ? "No photos yet" : "No matching photos"}
        </EmptyTitle>
        <EmptyDescription>
          {showUpload
            ? "Upload a photo to get started."
            : "Try changing your search or filters."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {showUpload ? (
          <Button
            size="sm"
            onClick={modal.onOpen}
            className="bg-[#0072F5] text-white hover:bg-[#005FCC]"
          >
            Add photo
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-[#0072F5] hover:bg-[#EBEBEB]"
          >
            Clear filters
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
};

export const ErrorStatus = () => {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 xl:px-8">
      <Empty className="min-h-[280px] rounded-xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>Please try again later.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="ghost" size="sm" onClick={resetBoundary}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
};

export const LoadingStatus = () => {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 xl:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex justify-end gap-2 border-t pt-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="size-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { columns } from "../components/columns";
import { DataTable } from "@/components/data-table";
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
import { IconAlertTriangle, IconPhotoOff } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    ]);
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
            <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
              Photo library
            </h2>
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
          <DataTable
            data={data.items}
            columns={columns}
            selectable
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
            containerClassName="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]"
            tableClassName="min-w-[980px]"
            headerClassName="[&_tr]:border-b [&_tr]:border-[#EBEBEB] dark:[&_tr]:border-[#303030]"
            headClassName="h-10 px-4 text-[11px] font-medium uppercase tracking-[0.07em] text-[#8F8F8F]"
            rowClassName="border-b border-[#EBEBEB] transition-none hover:bg-[#FAFAFA] data-[state=selected]:bg-[#F2F7FF] dark:border-[#303030] dark:hover:bg-[#202020] dark:data-[state=selected]:bg-[#13233A]"
            cellClassName="px-4 py-3"
          />
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
          <IconPhotoOff />
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
            <IconAlertTriangle />
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
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Skeleton className="size-4" />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Taken At</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Favorite</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="size-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-16 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

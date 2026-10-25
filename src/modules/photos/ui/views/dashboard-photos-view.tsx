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
    <div className="px-4 md:px-8">
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
          {selectedIds.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-3">
              <span className="mr-2 text-sm font-medium">
                {selectedIds.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ visibility: "public" })}
              >
                Make public
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ visibility: "private" })}
              >
                Make private
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ isFavorite: true })}
              >
                Favorite
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkUpdate.isPending}
                onClick={() => handleBulkUpdate({ isFavorite: false })}
              >
                Unfavorite
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={removePhoto.isPending}
                onClick={handleBulkDelete}
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
    </div>
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
    <Empty className="border border-dashed">
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
          <Button variant="outline" size="sm" onClick={modal.onOpen}>
            Add Photos
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onClear}>
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
    <div className="px-4 md:px-8">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconAlertTriangle />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>Please try again later.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={resetBoundary}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
};

export const LoadingStatus = () => {
  return (
    <div className="px-4 md:px-8">
      <div className="rounded-md border">
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

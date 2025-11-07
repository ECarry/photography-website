"use client";

import { useTRPC } from "@/trpc/client";
import { columns } from "../components/columns";
import { DataTable } from "@/components/data-table";
import { useSuspenseQuery } from "@tanstack/react-query";
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

export const DashboardPhotosView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = usePhotosFilters();
  const { data } = useSuspenseQuery(
    trpc.photos.getMany.queryOptions({ ...filters })
  );

  return (
    <div className="px-4 md:px-8">
      {data.items.length === 0 ? (
        <EmptyStatus />
      ) : (
        <>
          <DataTable data={data.items} columns={columns} />
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

const EmptyStatus = () => {
  const modal = useModal();

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconPhotoOff />
        </EmptyMedia>
        <EmptyTitle>No photos found</EmptyTitle>
        <EmptyDescription>
          You have no photos. Upload some photos to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={modal.onOpen}>
          Add Photos
        </Button>
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
              <TableHead className="pl-6 w-[510px]">Photos</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-36" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[180px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-xs truncate">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

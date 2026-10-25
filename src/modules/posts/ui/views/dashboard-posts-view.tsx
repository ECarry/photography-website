"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { usePostsFilters } from "../../hooks/use-posts-filters";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { DataPagination } from "@/components/data-pagination";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconNotebookOff } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE } from "@/constants";
import { Button } from "@/components/ui/button";

export const DashboardPostsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = usePostsFilters();

  const { data } = useSuspenseQuery(
    trpc.posts.getMany.queryOptions({ ...filters })
  );

  useEffect(() => {
    const lastAvailablePage = Math.max(DEFAULT_PAGE, data.totalPages);
    if (filters.page > lastAvailablePage) {
      setFilters({ page: lastAvailablePage });
    }
  }, [data.totalPages, filters.page, setFilters]);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6 xl:px-8">
      {data.items.length === 0 ? (
        <EmptyStatus
          hasSearch={Boolean(filters.search)}
          onClear={() => setFilters({ search: "", page: DEFAULT_PAGE })}
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
              Your stories
            </h2>
            <p className="text-xs tabular-nums text-[#8F8F8F]">
              {data.total.toLocaleString()} stories
            </p>
          </div>
          <DataTable
            columns={columns}
            data={data.items}
            containerClassName="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]"
            tableClassName="min-w-[720px]"
            headerClassName="[&_tr]:border-b [&_tr]:border-[#EBEBEB] dark:[&_tr]:border-[#303030]"
            headClassName="h-10 px-4 text-[11px] font-medium uppercase tracking-[0.07em] text-[#8F8F8F]"
            rowClassName="border-b border-[#EBEBEB] transition-none hover:bg-[#FAFAFA] dark:border-[#303030] dark:hover:bg-[#202020]"
            cellClassName="px-4 py-3"
          />
          <DataPagination
            page={filters.page}
            totalPages={data.totalPages}
            onPageChange={(page) => setFilters({ page })}
          />
        </>
      )}
    </main>
  );
};

const EmptyStatus = ({
  hasSearch,
  onClear,
}: {
  hasSearch: boolean;
  onClear: () => void;
}) => {
  return (
    <Empty className="min-h-[280px] rounded-xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconNotebookOff />
        </EmptyMedia>
        <EmptyTitle>{hasSearch ? "No matching stories" : "No stories yet"}</EmptyTitle>
        <EmptyDescription>
          {hasSearch
            ? "Try a different search term."
            : "Create a story to share the context behind your photographs."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {hasSearch ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear search
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            className="bg-[#0072F5] text-white hover:bg-[#005FCC]"
          >
            <Link href="/dashboard/posts/new">Write your first story</Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
};

export const ErrorStatus = () => {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 xl:px-8">
      <Empty className="min-h-[280px] rounded-xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
        <EmptyHeader>
          <EmptyTitle>Could not load stories</EmptyTitle>
          <EmptyDescription>Please refresh the page and try again.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export const LoadingStatus = () => {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6 xl:px-8">
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 px-4 text-[11px] font-medium uppercase tracking-[0.07em] text-[#8F8F8F]">Story</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-[180px]" />
                    <Skeleton className="h-3 w-[260px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

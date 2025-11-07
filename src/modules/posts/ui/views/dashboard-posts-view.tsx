"use client";

import { useRouter } from "next/navigation";
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

export const DashboardPostsView = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const [filters, setFilters] = usePostsFilters();

  const { data } = useSuspenseQuery(
    trpc.posts.getMany.queryOptions({ ...filters })
  );

  return (
    <>
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        {data.items.length === 0 ? (
          <EmptyStatus />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.items}
              onRowClick={(row) => {
                router.push(`/dashboard/posts/${row.slug}`);
              }}
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
    </>
  );
};

const EmptyStatus = () => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconNotebookOff />
        </EmptyMedia>
        <EmptyTitle>No posts found</EmptyTitle>
        <EmptyDescription>
          You have no posts. Create some posts to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
};

export const ErrorStatus = () => {
  return <div>Something went wrong</div>;
};

export const LoadingStatus = () => {
  return <div>Loading...</div>;
};

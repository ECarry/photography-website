import { Metadata } from "next";
import { getQueryClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  LoadingState,
  PhotographView,
} from "@/modules/photograph/ui/views/photograph-view";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.home.getPhotoById.queryOptions({ id })
  );

  return {
    title: data.title,
    description: data.description,
  };
}

const page = async ({ params }: Props) => {
  const id = (await params).id;
  const queryClient = getQueryClient();
  await queryClient.fetchQuery(trpc.home.getPhotoById.queryOptions({ id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LoadingState />}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <PhotographView id={id} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;

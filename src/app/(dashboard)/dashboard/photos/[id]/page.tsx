import { Metadata } from "next";
import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { PhotoIdView } from "@/modules/photos/ui/views/photo-id-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;

  const queryClient = getQueryClient();
  const photo = await queryClient.fetchQuery(
    trpc.photos.getOne.queryOptions({
      id,
    })
  );

  return {
    title: photo.title,
  };
}

const Page = async ({ params }: Props) => {
  const { id } = await params;

  const queryClient = getQueryClient();
  await queryClient.fetchQuery(
    trpc.photos.getOne.queryOptions({
      id,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <PhotoIdView id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

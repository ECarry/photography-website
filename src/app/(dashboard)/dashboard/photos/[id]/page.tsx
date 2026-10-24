import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
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

async function fetchPhotoOrNotFound(id: string) {
  const queryClient = getQueryClient();

  try {
    const photo = await queryClient.fetchQuery(
      trpc.photos.getOne.queryOptions({ id }),
    );
    if (!photo) notFound();
    return photo;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const photo = await fetchPhotoOrNotFound(id);

  return {
    title: photo.title,
  };
}

const Page = async ({ params }: Props) => {
  const { id } = await params;
  await fetchPhotoOrNotFound(id);

  const queryClient = getQueryClient();
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

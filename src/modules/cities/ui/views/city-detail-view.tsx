"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  ArrowLeft,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import BlurImage from "@/components/blur-image";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { formatPhotoDate } from "@/modules/cities/format-photo-date";
import { CityPhotoCard } from "../components/city-photo-card";

const cityDescriptionSchema = z.object({
  description: z.string().optional(),
});

type CityDescriptionForm = z.infer<typeof cityDescriptionSchema>;

interface CityDetailViewProps {
  city: string;
}

export function CityDetailView({ city }: CityDetailViewProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: cityData } = useSuspenseQuery(
    trpc.city.getOne.queryOptions({ city })
  );

  const form = useForm<CityDescriptionForm>({
    resolver: zodResolver(cityDescriptionSchema),
    defaultValues: {
      description: "",
    },
  });

  const updateCoverPhoto = useMutation(
    trpc.city.updateCoverPhoto.mutationOptions({
      onMutate: async ({ cityId, photoId }) => {
        const detailQuery = trpc.city.getOne.queryOptions({ city });
        const listQuery = trpc.city.getMany.queryOptions();

        await Promise.all([
          queryClient.cancelQueries(detailQuery),
          queryClient.cancelQueries(listQuery),
        ]);

        const previousCity = queryClient.getQueryData(detailQuery.queryKey);
        const previousCities = queryClient.getQueryData(listQuery.queryKey);
        const coverPhoto = previousCity?.photos.find(
          (photo) => photo.id === photoId,
        );

        if (previousCity) {
          queryClient.setQueryData(detailQuery.queryKey, {
            ...previousCity,
            coverPhotoId: photoId,
          });
        }

        if (previousCities) {
          queryClient.setQueryData(
            listQuery.queryKey,
            previousCities.map((citySet) =>
              citySet.id === cityId
                ? {
                    ...citySet,
                    coverPhotoId: photoId,
                    ...(coverPhoto
                      ? {
                          coverPhotoUrl: coverPhoto.url,
                          coverPhotoBlurData: coverPhoto.blurData,
                          coverPhotoTitle: coverPhoto.title,
                        }
                      : {}),
                  }
                : citySet,
            ),
          );
        }

        return { previousCity, previousCities };
      },
      onError: (error, _variables, context) => {
        const detailQuery = trpc.city.getOne.queryOptions({ city });
        const listQuery = trpc.city.getMany.queryOptions();

        if (context?.previousCity !== undefined) {
          queryClient.setQueryData(detailQuery.queryKey, context.previousCity);
        }
        if (context?.previousCities !== undefined) {
          queryClient.setQueryData(listQuery.queryKey, context.previousCities);
        }
        toast.error(error.message || "Failed to update city cover photo");
      },
      onSuccess: () => {
        toast.success("City cover photo updated");
      },
      onSettled: async () => {
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.city.getOne.queryOptions({ city }),
          ),
          queryClient.invalidateQueries(trpc.city.getMany.queryOptions()),
          queryClient.invalidateQueries(
            trpc.home.getCitySets.queryOptions({ limit: 12 }),
          ),
          queryClient.invalidateQueries(trpc.travel.getCitySets.queryOptions()),
        ]);
      },
    }),
  );

  const updatePhoto = useMutation(
    trpc.photos.update.mutationOptions({
      onMutate: async (variables) => {
        const detailQuery = trpc.city.getOne.queryOptions({ city });
        await queryClient.cancelQueries(detailQuery);

        const previousCity = queryClient.getQueryData(detailQuery.queryKey);
        if (previousCity) {
          const { id, ...changes } = variables;
          queryClient.setQueryData(detailQuery.queryKey, {
            ...previousCity,
            photos: previousCity.photos.map((photo) =>
              photo.id === id ? { ...photo, ...changes } : photo,
            ),
          });
        }

        return { previousCity };
      },
      onError: (error, _variables, context) => {
        const detailQuery = trpc.city.getOne.queryOptions({ city });
        if (context?.previousCity !== undefined) {
          queryClient.setQueryData(detailQuery.queryKey, context.previousCity);
        }
        toast.error(error.message || "Failed to update photo");
      },
      onSuccess: (_photo, variables) => {
        if (variables.visibility !== undefined) {
          toast.success(
            variables.visibility === "public"
              ? "Photo is now public"
              : "Photo is now private",
          );
        } else if (variables.isFavorite !== undefined) {
          toast.success(
            variables.isFavorite
              ? "Added to favorites"
              : "Removed from favorites",
          );
        }
      },
      onSettled: async () => {
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.city.getOne.queryOptions({ city }),
          ),
          queryClient.invalidateQueries(trpc.city.getMany.queryOptions()),
          queryClient.invalidateQueries(trpc.photos.getMany.queryOptions({})),
          queryClient.invalidateQueries(
            trpc.home.getManyLikePhotos.queryOptions({ limit: 10 }),
          ),
          queryClient.invalidateQueries(
            trpc.home.getCitySets.queryOptions({ limit: 12 }),
          ),
          queryClient.invalidateQueries(trpc.travel.getCitySets.queryOptions()),
        ]);
      },
    }),
  );

  const updateDescription = useMutation(
    trpc.city.updateDescription.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.city.getOne.queryOptions({ city })
        );
        await queryClient.invalidateQueries(trpc.city.getMany.queryOptions());
        await queryClient.invalidateQueries(
          trpc.home.getCitySets.queryOptions({ limit: 12 })
        );
        await queryClient.invalidateQueries(
          trpc.travel.getCitySets.queryOptions()
        );
        toast.success("Description updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update description");
      },
    })
  );

  useEffect(() => {
    if (cityData?.description !== undefined) {
      form.setValue("description", cityData.description || "");
    }
  }, [cityData?.description, form]);

  const handleSetCover = (photoId: string) => {
    if (!cityData || cityData.coverPhotoId === photoId) return;
    const photo = cityData.photos.find((item) => item.id === photoId);
    if (photo?.visibility !== "public") return;
    updateCoverPhoto.mutate({ cityId: cityData.id, photoId });
  };

  if (!cityData) {
    return (
      <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="mx-auto flex min-h-[60vh] max-w-[1400px] flex-col items-center justify-center px-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-white text-[#8F8F8F] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
            <MapPin className="size-6" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-[-0.6px] text-[#171717] dark:text-[#FAFAFA]">
            City not found
          </h1>
          <p className="mt-2 max-w-md text-sm text-[#8F8F8F]">
            This city collection may have been removed.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-5 h-9 rounded-md bg-white text-[#4D4D4D] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] dark:text-[#B3B3B3]"
          >
            <Link href="/dashboard/cities">
              <ArrowLeft className="size-4" />
              All cities
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const coverPhoto = cityData.photos.find(
    (photo) => photo.id === cityData.coverPhotoId,
  );
  const publicPhotoCount = cityData.photos.filter(
    (photo) => photo.visibility === "public",
  ).length;

  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <Link
          href="/dashboard/cities"
          className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm text-[#4D4D4D] transition-none hover:bg-[#EBEBEB] hover:text-[#171717] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FAFAFA,0_0_0_4px_#0072F5] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All cities
        </Link>

        <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
              CITY COLLECTION
            </p>
            <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
              {cityData.city}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-4 text-[#8F8F8F]" />
                {cityData.country}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon aria-hidden="true" className="size-4 text-[#8F8F8F]" />
                {cityData.photoCount.toLocaleString()} photos
              </span>
              <span className="text-xs text-[#8F8F8F]">
                {publicPhotoCount} public
              </span>
            </div>
          </div>
        </header>

        <div className="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <section className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6">
            <div className="mb-4">
              <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                About this place
              </h2>
              <p className="mt-1 text-xs text-[#8F8F8F]">
                Add a short note to remember this destination.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  updateDescription.mutate({
                    cityId: cityData.id,
                    description: values.description || "",
                  });
                })}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">City description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Write a note about this city..."
                          className="min-h-[112px] resize-y rounded-md border-0 bg-[#FAFAFA] px-3 py-2.5 text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#005FCC] dark:bg-[#0A0A0A]"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateDescription.isPending}
                    className="h-9 rounded-md bg-[#0072F5] px-4 text-sm font-medium text-white shadow-none hover:bg-[#005FCC]"
                  >
                    {updateDescription.isPending ? "Saving..." : "Save note"}
                  </Button>
                </div>
              </form>
            </Form>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                  City cover
                </h2>
                <p className="mt-1 text-xs text-[#8F8F8F]">
                  The public image used across your collections.
                </p>
              </div>
              {coverPhoto && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${
                      coverPhoto.visibility === "public"
                        ? "bg-[#398E4A]"
                        : "bg-[#8F8F8F]"
                    }`}
                  />
                  {coverPhoto.visibility === "public" ? "Public" : "Private"}
                </span>
              )}
            </div>
            {coverPhoto ? (
              <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#F2F2F2] dark:bg-[#262626]">
                  <BlurImage
                    src={keyToUrl(coverPhoto.url)}
                    alt={coverPhoto.title || `${cityData.city} cover`}
                    blurhash={coverPhoto.blurData}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                    {coverPhoto.title || "Untitled photo"}
                  </p>
                  <p className="mt-1 text-xs text-[#8F8F8F]">
                    {coverPhoto.dateTimeOriginal
                      ? formatPhotoDate(coverPhoto.dateTimeOriginal)
                      : "Date not recorded"}
                  </p>
                  {coverPhoto.visibility !== "public" && (
                    <p className="mt-2 text-xs text-[#8F8F8F]">
                      This private cover is not visible on the homepage.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-md bg-[#FAFAFA] px-3 py-4 text-sm text-[#8F8F8F] dark:bg-[#0A0A0A]">
                No cover photo is selected.
              </p>
            )}
          </section>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.6px] text-[#171717] dark:text-[#FAFAFA]">
                Photos
              </h2>
              <p className="mt-1 text-sm text-[#8F8F8F]">
                Set a public cover, update visibility, or mark favorites.
              </p>
            </div>
            <span className="text-xs tabular-nums text-[#8F8F8F]">
              {cityData.photos.length.toLocaleString()} photos
            </span>
          </div>
          {cityData.photos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {cityData.photos.map((photo) => (
                <CityPhotoCard
                  key={photo.id}
                  photo={photo}
                  city={cityData.city}
                  isCoverPhoto={photo.id === cityData.coverPhotoId}
                  isCoverMutationPending={updateCoverPhoto.isPending}
                  isPhotoMutationPending={updatePhoto.isPending}
                  onSetCover={handleSetCover}
                  onToggleVisibility={(item) =>
                    updatePhoto.mutate({
                      id: item.id,
                      visibility:
                        item.visibility === "public" ? "private" : "public",
                    })
                  }
                  onToggleFavorite={(item) =>
                    updatePhoto.mutate({
                      id: item.id,
                      isFavorite: !item.isFavorite,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white px-6 py-12 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
              <p className="text-sm text-[#8F8F8F]">
                No photos are currently assigned to this city.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function CityDetailLoadingView() {
  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 md:px-6 md:py-8 xl:px-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-5 h-10 w-60" />
        <Skeleton className="mt-3 h-4 w-64" />
        <div className="mt-7 grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-[220px] rounded-xl" />
          <Skeleton className="h-[220px] rounded-xl" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function CityDetailErrorView() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAFAFA] px-4 text-center dark:bg-[#0A0A0A]">
      <p className="text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
        Failed to load city details
      </p>
      <p className="mt-1 text-sm text-[#8F8F8F]">Please try again.</p>
      <Button
        asChild
        variant="outline"
        className="mt-4 h-9 rounded-md bg-white text-[#4D4D4D] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] dark:text-[#B3B3B3]"
      >
        <Link href="/dashboard/cities">
          <ArrowLeft className="size-4" />
          All cities
        </Link>
      </Button>
    </main>
  );
}

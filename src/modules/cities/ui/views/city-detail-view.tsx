"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  ArrowLeft,
  MapPin,
  Image as ImageIcon,
  Heart,
  ImagePlus,
  Check,
  Eye,
  EyeOff,
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
import { FramedPhoto } from "@/components/framed-photo";
import { formatPhotoDate } from "@/modules/cities/format-photo-date";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">City not found</h3>
            <p className="text-muted-foreground text-sm">
              The city you&apos;re looking for doesn&apos;t exist or may have
              been removed.
            </p>
          </div>
          <Link href="/dashboard/cities">
            <Button variant="outline" className="min-w-[140px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/dashboard/cities">
              <Button variant="ghost" className="mb-4 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cities
              </Button>
            </Link>
          </div>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  {cityData.city}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{cityData.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm">
                      {cityData.photoCount} photos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Form Card */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    updateDescription.mutate({
                      cityId: cityData.id,
                      description: values.description || "",
                    });
                  })}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          City Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Add a description for this city..."
                            className="min-h-[100px] resize-none"
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
                      className="min-w-[100px]"
                    >
                      {updateDescription.isPending
                        ? "Saving..."
                        : "Save Description"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-1 gap-y-6">
        {cityData.photos.map((photo) => {
          const isCoverPhoto = photo.id === cityData.coverPhotoId;
          const isPublicPhoto = photo.visibility === "public";
          const coverButtonLabel = isCoverPhoto
            ? isPublicPhoto
              ? "Current public city cover photo"
              : "Current cover is private; choose a public photo"
            : isPublicPhoto
              ? "Set as city cover photo"
              : "Private photos cannot be city covers";

          return (
            <div key={photo.id} className="space-y-4">
              <div className="relative space-y-4 flex items-center justify-center bg-gray-50 dark:bg-muted h-[80vh] p-20">
                <FramedPhoto
                  src={photo.url}
                  alt={cityData.city}
                  blurhash={photo.blurData!}
                  width={photo.width}
                  height={photo.height}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Button
                    variant={isCoverPhoto ? "default" : "outline"}
                    size="icon"
                    onClick={() => handleSetCover(photo.id)}
                    disabled={updateCoverPhoto.isPending || !isPublicPhoto}
                    aria-label={coverButtonLabel}
                    aria-pressed={isCoverPhoto}
                    title={coverButtonLabel}
                  >
                    <span className="relative flex size-5 items-center justify-center">
                      {isCoverPhoto ? (
                        <>
                          <ImageIcon className="size-5" />
                          <Check className="absolute -right-1 -top-1 size-3 rounded-full bg-background text-primary" />
                        </>
                      ) : (
                        <ImagePlus className="size-5" />
                      )}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={
                      updatePhoto.isPending ||
                      (isCoverPhoto && photo.visibility === "public")
                    }
                    onClick={() =>
                      updatePhoto.mutate({
                        id: photo.id,
                        visibility:
                          photo.visibility === "public" ? "private" : "public",
                      })
                    }
                    aria-label={
                      isCoverPhoto && photo.visibility === "public"
                        ? "Choose another cover before making this photo private"
                        : photo.visibility === "public"
                          ? "Make photo private"
                          : "Make photo public"
                    }
                    title={
                      isCoverPhoto && photo.visibility === "public"
                        ? "Choose another public cover before making this photo private"
                        : photo.visibility === "public"
                          ? "Make photo private"
                          : "Make photo public"
                    }
                  >
                    {photo.visibility === "public" ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={updatePhoto.isPending}
                    onClick={() =>
                      updatePhoto.mutate({
                        id: photo.id,
                        isFavorite: !photo.isFavorite,
                      })
                    }
                    aria-label={
                      photo.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    aria-pressed={photo.isFavorite}
                    title={
                      photo.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={
                        photo.isFavorite
                          ? "size-4 fill-current text-red-500"
                          : "size-4"
                      }
                    />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col w-full items-center justify-center">
                <p className="text-sm font-medium">{photo.title}</p>
                <p className="text-xs text-muted-foreground">
                  {photo.dateTimeOriginal
                    ? formatPhotoDate(photo.dateTimeOriginal)
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CityDetailLoadingView() {
  return (
    <div className="space-y-6 px-4 md:px-8">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function CityDetailErrorView() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4 md:px-8">
      <p className="text-destructive mb-2">Failed to load city details</p>
      <Link href="/dashboard/cities">
        <Button variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cities
        </Button>
      </Link>
    </div>
  );
}

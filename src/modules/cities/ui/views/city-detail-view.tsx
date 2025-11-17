"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  ArrowLeft,
  MapPin,
  Image as ImageIcon,
  Star,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BlurImage from "@/components/blur-image";
import { keyToImage } from "@/lib/keyToImage";
import Link from "next/link";
import { format } from "date-fns";
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
    trpc.city.updateCoverPhoto.mutationOptions()
  );

  const updateDescription = useMutation(
    trpc.city.updateDescription.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.city.getOne.queryOptions({ city })
        );
        await queryClient.invalidateQueries(trpc.city.getMany.queryOptions());
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

  const handleSetCover = async (photoId: string) => {
    if (!cityData) return;

    updateCoverPhoto.mutate(
      {
        cityId: cityData.id,
        photoId: photoId,
      },
      {
        onSuccess: async () => {
          // Invalidate both queries to refresh data
          await queryClient.invalidateQueries(
            trpc.city.getOne.queryOptions({ city })
          );
          await queryClient.invalidateQueries(trpc.city.getMany.queryOptions());
          toast.success("Cover photo updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update cover photo");
        },
      }
    );
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
    <>
      <div className="min-h-screen bg-background">
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

          {/* Photos Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Photos</h2>
              {cityData.photos && cityData.photos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {cityData.photos.length} photo
                  {cityData.photos.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {cityData.photos && cityData.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cityData.photos.map((photo) => {
                  const isCover = cityData.coverPhotoId === photo.id;

                  return (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-muted border shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Link
                        href={`/dashboard/photos/${photo.id}`}
                        className="block h-full"
                      >
                        <BlurImage
                          src={keyToImage(photo.url)}
                          alt={photo.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          blurhash={photo.blurData!}
                        />
                      </Link>

                      {/* Cover Badge */}
                      {isCover && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                          <Star className="h-3 w-3 fill-current" />
                          Cover
                        </div>
                      )}

                      {/* Overlay with enhanced styling */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {/* Set Cover Button */}
                        {!isCover && (
                          <div className="absolute top-3 right-3">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSetCover(photo.id);
                              }}
                              disabled={updateCoverPhoto.isPending}
                              className="h-8 px-3 text-xs backdrop-blur-sm bg-white/90 hover:bg-white text-black border-0 shadow-lg"
                            >
                              <Star className="mr-1.5 h-3 w-3" />
                              Set Cover
                            </Button>
                          </div>
                        )}

                        {/* Photo Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-medium text-sm truncate mb-1">
                            {photo.title}
                          </p>
                          {photo.dateTimeOriginal && (
                            <p
                              className="text-white/90 text-xs"
                              suppressHydrationWarning
                            >
                              {format(
                                new Date(photo.dateTimeOriginal),
                                "MMM d, yyyy"
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border rounded-xl p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No photos yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Photos taken in {cityData.city} will appear here automatically
                  when you upload them.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-3">
        {cityData.photos && cityData.photos.length > 0 && (
          <div className="relative">
            <FramedPhoto
              src={cityData.photos[0].url}
              alt={cityData.city}
              aspectRatio={cityData.photos[0].aspectRatio}
              blurhash={cityData.photos[0].blurData!}
              width={cityData.photos[0].width}
              height={cityData.photos[0].height}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Star />
              </Button>
              <Button variant="outline" size="icon">
                <Heart />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
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

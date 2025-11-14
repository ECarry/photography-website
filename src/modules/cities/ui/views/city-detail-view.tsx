"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { ArrowLeft, MapPin, Image as ImageIcon, Star } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">City not found</h3>
        <Link href="/dashboard/cities">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cities
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-8 py-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{cityData.city}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>{cityData.photoCount} photos</span>
        </div>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter city description"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateDescription.isPending}>
              {updateDescription.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Photos Grid */}
      {cityData.photos && cityData.photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cityData.photos.map((photo) => {
            const isCover = cityData.coverPhotoId === photo.id;

            return (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Link
                  href={`/dashboard/photos/${photo.id}`}
                  className="block h-full"
                >
                  <BlurImage
                    src={keyToImage(photo.url)}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    blurhash={photo.blurData!}
                  />
                </Link>

                {/* Cover Badge */}
                {isCover && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Cover
                  </div>
                )}

                {/* Overlay with title and set cover button */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        className="h-8 px-3 text-xs"
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Set as Cover
                      </Button>
                    </div>
                  )}

                  {/* Photo Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm truncate">
                      {photo.title}
                    </p>
                    {photo.dateTimeOriginal && (
                      <p
                        className="text-white/80 text-xs mt-1"
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
        <div className="flex flex-col items-center justify-center py-16 text-center px-4 md:px-8">
          <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No photos in this city</p>
        </div>
      )}
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

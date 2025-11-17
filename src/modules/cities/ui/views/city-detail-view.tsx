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
  StarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";

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
        {cityData.photos.map((photo) => (
          <div key={photo.id} className="space-y-4">
            <div
              className={cn(
                "relative space-y-4 flex items-center justify-center bg-gray-50 dark:bg-muted h-[80vh]",
                photo.aspectRatio < 1 ? "px-20 py-50" : "px-10 py-50"
              )}
            >
              <FramedPhoto
                src={photo.url}
                alt={cityData.city}
                blurhash={photo.blurData!}
                width={photo.width}
                height={photo.height}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSetCover(photo.id)}
                >
                  {photo.id === cityData.coverPhotoId ? <Star /> : <StarOff />}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart />
                </Button>
              </div>
            </div>
            <div className="flex flex-col w-full items-center justify-center">
              <p className="text-sm font-medium">{photo.title}</p>
              <p className="text-xs text-muted-foreground">
                {photo.dateTimeOriginal
                  ? format(photo.dateTimeOriginal, "d MMM yyyy")
                  : ""}
              </p>
            </div>
          </div>
        ))}
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

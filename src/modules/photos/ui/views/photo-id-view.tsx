"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import BlurImage from "@/components/blur-image";
import { photosUpdateSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ApertureSelector } from "../components/aperture-selector";
import { ShutterSpeedSelector } from "../components/shutter-speed-selector";
import { ISOSelector } from "../components/iso-selector";
import { ExposureCompensationSelector } from "../components/exposure-compensation-selector";
import { toast } from "sonner";
import { fetchAddressByCoordinates } from "@/modules/mapbox/hooks/use-get-address";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { formatPhotoDate } from "@/modules/cities/format-photo-date";

interface PhotoIdViewProps {
  id: string;
}

const MapboxComponent = dynamic(
  () => import("@/modules/mapbox/ui/components/map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-md bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#262626]">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
);

const formSchema = photosUpdateSchema.extend({
  make: z.string().optional(),
  model: z.string().optional(),
  lensModel: z.string().optional(),
  focalLength: z.number().optional(),
  focalLength35mm: z.number().optional(),
  fNumber: z.number().optional(),
  iso: z.number().optional(),
  exposureTime: z.number().optional(),
  exposureCompensation: z.number().optional(),
});

export const PhotoIdView = ({ id }: PhotoIdViewProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const { data } = useSuspenseQuery(
    trpc.photos.getOne.queryOptions({
      id,
    })
  );

  const updateMutation = useMutation(
    trpc.photos.update.mutationOptions({
      onSuccess: async (updatedPhoto) => {
        setCurrentLocation({
          lat: updatedPhoto.latitude ?? null,
          lng: updatedPhoto.longitude ?? null,
        });
        queryClient.setQueryData(
          trpc.photos.getOne.queryKey({ id: updatedPhoto.id }),
          updatedPhoto,
        );
        await Promise.all([
          queryClient.invalidateQueries(trpc.photos.getMany.queryOptions({})),
          queryClient.invalidateQueries(
            trpc.home.getCitySets.queryOptions({ limit: 9 }),
          ),
          queryClient.invalidateQueries(trpc.city.getMany.queryOptions()),
          queryClient.invalidateQueries(
            trpc.dashboard.getDashboardStats.queryOptions(),
          ),
        ]);
        toast.success("Photo updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update photo");
      },
    })
  );

  const [currentLocation, setCurrentLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: data.latitude ?? null,
    lng: data.longitude ?? null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data.id,
      title: data.title ?? "",
      description: data.description ?? "",
      visibility: data.visibility ?? "private",
      isFavorite: data.isFavorite ?? false,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      make: data.make ?? undefined,
      model: data.model ?? undefined,
      lensModel: data.lensModel ?? undefined,
      focalLength: data.focalLength ?? undefined,
      focalLength35mm: data.focalLength35mm ?? undefined,
      fNumber: data.fNumber ?? undefined,
      iso: data.iso ?? undefined,
      exposureTime: data.exposureTime ?? undefined,
      exposureCompensation: data.exposureCompensation ?? undefined,
    },
  });

  const isSubmitting = updateMutation.isPending || isResolvingLocation;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const latitude = values.latitude ?? null;
    const longitude = values.longitude ?? null;
    const coordinatesChanged =
      latitude !== (data.latitude ?? null) ||
      longitude !== (data.longitude ?? null);

    let locationFields = {};
    if (coordinatesChanged) {
      if (latitude == null || longitude == null) {
        locationFields = {
          country: null,
          countryCode: null,
          region: null,
          city: null,
          district: null,
          fullAddress: null,
          placeFormatted: null,
        };
      } else {
        setIsResolvingLocation(true);
        try {
          const address = await fetchAddressByCoordinates({
            lat: latitude,
            lng: longitude,
          });
          const properties = address.features[0]?.properties;
          const context = properties?.context;
          const countryCode = context?.country?.country_code ?? null;
          const region = context?.region?.name ?? null;

          locationFields = {
            country: context?.country?.name ?? null,
            countryCode,
            region,
            city:
              countryCode === "JP" || countryCode === "TW"
                ? region
                : (context?.place?.name ?? null),
            district: context?.locality?.name ?? null,
            fullAddress: properties?.full_address ?? null,
            placeFormatted: properties?.place_formatted ?? null,
          };
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `Could not resolve this location: ${error.message}`
              : "Could not resolve this location",
          );
          return;
        } finally {
          setIsResolvingLocation(false);
        }
      }
    }

    updateMutation.mutate({
      ...values,
      latitude,
      longitude,
      ...locationFields,
      id: data.id,
    });
  }

  const takenAt = data.dateTimeOriginal
    ? formatPhotoDate(data.dateTimeOriginal)
    : null;

  return (
    <main className="min-h-full bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <Link
          href="/dashboard/photos"
          className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm text-[#4D4D4D] transition-none hover:bg-[#EBEBEB] hover:text-[#171717] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FAFAFA,0_0_0_4px_#0072F5] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
        >
          <ArrowLeft className="size-4" />
          All photos
        </Link>
        <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
              PHOTO EDITOR
            </p>
            <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
              {data.title || "Untitled photo"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
              {takenAt && <span>Taken {takenAt}</span>}
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${
                    data.visibility === "public" ? "bg-[#398E4A]" : "bg-[#8F8F8F]"
                  }`}
                />
                {data.visibility === "public" ? "Public" : "Private"}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            form="photo-edit-form"
            disabled={isSubmitting}
            className="h-10 w-full rounded-md bg-[#0072F5] px-4 text-sm font-medium text-white shadow-none hover:bg-[#005FCC] focus-visible:ring-2 focus-visible:ring-[#0072F5] focus-visible:ring-offset-2 sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </header>

        <div className="mt-7 grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          {/* Form on the left */}
          <section className="w-full rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6">
            <div className="mb-5">
              <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                Photo details
              </h2>
              <p className="mt-1 text-xs text-[#8F8F8F]">
                Update the description, camera data, and location.
              </p>
            </div>
            <Form {...form}>
              <form
                id="photo-edit-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 [&_input]:border-0 [&_input]:bg-[#FAFAFA] [&_input]:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] [&_input]:focus-visible:ring-0 [&_textarea]:border-0 [&_textarea]:bg-[#FAFAFA] [&_textarea]:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] [&_textarea]:focus-visible:ring-0 dark:[&_input]:bg-[#0A0A0A] dark:[&_textarea]:bg-[#0A0A0A]"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Photo title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          className="resize-none"
                          placeholder="Photo description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg bg-[#FAFAFA] px-4 py-3 dark:bg-[#0A0A0A]">
                        <div className="flex items-center justify-between gap-4">
                          <FormLabel>Visibility</FormLabel>
                          <div className="flex items-center gap-2 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
                            <span>
                              {field.value === "public" ? "Public" : "Private"}
                            </span>
                            <FormControl>
                              <Switch
                                checked={field.value === "public"}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked ? "public" : "private")
                                }
                              />
                            </FormControl>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFavorite"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg bg-[#FAFAFA] px-4 py-3 dark:bg-[#0A0A0A]">
                        <FormLabel>Favorite</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Camera parameters */}
                <div className="@container min-w-0 space-y-5 rounded-lg bg-[#FAFAFA] p-4 dark:bg-[#0A0A0A] sm:p-5">
                  <div>
                    <h3 className="text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                      Camera and lens
                    </h3>
                    <p className="mt-1 text-xs text-[#8F8F8F]">
                      Auto-filled from EXIF when available.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Camera Make</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Canon" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Camera Model</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., EOS R5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="lensModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lens Model</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., RF 24-70mm f/2.8L"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 pt-2 @sm:grid-cols-2">
                    <h4 className="col-span-full text-xs font-medium tracking-wide text-[#8F8F8F]">
                      Focal length
                    </h4>
                    <FormField
                      control={form.control}
                      name="focalLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Focal Length (mm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? undefined : Number(value)
                                );
                              }}
                              placeholder="50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="focalLength35mm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>35mm Equivalent (mm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? undefined : Number(value)
                                );
                              }}
                              placeholder="50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 items-start gap-4 pt-2 @sm:grid-cols-2 @3xl:grid-cols-4">
                    <h4 className="col-span-full text-xs font-medium tracking-wide text-[#8F8F8F]">
                      Exposure settings
                    </h4>
                    <FormField
                      control={form.control}
                      name="fNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aperture</FormLabel>
                          <FormControl>
                            <ApertureSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exposureTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shutter Speed</FormLabel>
                          <FormControl>
                            <ShutterSpeedSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="iso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISO</FormLabel>
                          <FormControl>
                            <ISOSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exposureCompensation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compensation (EV)</FormLabel>
                          <FormControl>
                            <ExposureCompensationSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <section className="space-y-4 rounded-lg bg-[#FAFAFA] p-4 dark:bg-[#0A0A0A] sm:p-5">
                  <div>
                    <h3 className="text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                      Coordinates
                    </h3>
                    <p className="mt-1 text-xs text-[#8F8F8F]">
                      Moving the map marker also updates these values.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue =
                                value === "" ? undefined : Number(value);
                              field.onChange(numericValue);
                              setCurrentLocation((prev) => ({
                                lat:
                                  numericValue ??
                                  prev?.lat ??
                                  data.latitude ??
                                  null,
                                lng: prev?.lng ?? data.longitude ?? null,
                              }));
                            }}
                            placeholder="e.g. 37.7749"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue =
                                value === "" ? undefined : Number(value);
                              field.onChange(numericValue);
                              setCurrentLocation((prev) => ({
                                lat: prev?.lat ?? data.latitude ?? null,
                                lng:
                                  numericValue ??
                                  prev?.lng ??
                                  data.longitude ??
                                  null,
                              }));
                            }}
                            placeholder="e.g. -122.4194"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                </section>

                <div className="sticky bottom-3 flex justify-end rounded-lg bg-white/95 p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]/95">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 rounded-md bg-[#0072F5] px-4 text-sm font-medium text-white shadow-none hover:bg-[#005FCC]"
                  >
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </section>

          {/* Photo + Map on the right */}
          <aside className="space-y-4">
            <section className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Camera className="size-4 text-[#8F8F8F]" />
                  <h2 className="text-[14px] font-medium text-[#171717] dark:text-[#FAFAFA]">
                    Preview
                  </h2>
                </div>
                <span className="text-xs tabular-nums text-[#8F8F8F]">
                  {data.width} × {data.height}
                </span>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#262626]">
                <BlurImage
                  src={keyToUrl(data.url)}
                  alt={data.title || "Photo preview"}
                  blurhash={data.blurData}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-3 truncate text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                {data.title || "Untitled photo"}
              </p>
              <p className="mt-1 text-xs text-[#8F8F8F]">
                {takenAt ? `Taken ${takenAt}` : "No capture date recorded"}
              </p>
            </section>

            <section className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="size-4 text-[#8F8F8F]" />
                <h2 className="text-[14px] font-medium text-[#171717] dark:text-[#FAFAFA]">
                  Location
                </h2>
              </div>
              <p className="mb-3 text-xs leading-4 text-[#8F8F8F]">
                {currentLocation.lat == null || currentLocation.lng == null
                  ? "Drag the marker to choose a location. It will be saved with your changes."
                  : "Drag the marker to adjust this photo’s location."}
              </p>
              <div className="h-[240px] w-full overflow-hidden rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.08)] sm:h-[280px]">
                <Suspense
                  fallback={
                    <Skeleton className="h-full w-full rounded-md" />
                  }
                >
                  <MapboxComponent
                    draggableMarker
                    markers={
                      currentLocation?.lat != null &&
                      currentLocation?.lng != null
                        ? [
                            {
                              id: "photo-location",
                              longitude: currentLocation.lng,
                              latitude: currentLocation.lat,
                            },
                          ]
                        : []
                    }
                    initialViewState={{
                      longitude: currentLocation?.lng ?? 0,
                      latitude: currentLocation?.lat ?? 0,
                      zoom:
                        currentLocation?.lat != null &&
                        currentLocation?.lng != null
                          ? 10
                          : 2,
                    }}
                    onMarkerDragEnd={(markerId, lngLat) => {
                      setCurrentLocation({ lat: lngLat.lat, lng: lngLat.lng });
                      form.setValue("latitude", lngLat.lat, { shouldDirty: true, shouldValidate: true });
                      form.setValue("longitude", lngLat.lng, { shouldDirty: true, shouldValidate: true });
                    }}
                  />
                </Suspense>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

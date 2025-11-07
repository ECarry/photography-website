import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Search, MapPin } from "lucide-react";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { thirdStepSchema, StepProps } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatGPSCoordinates } from "@/lib/utils";
import { useGetAddress } from "@/modules/mapbox/hooks/use-get-address";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const MapboxComponent = dynamic(
  () => import("@/modules/mapbox/ui/components/map"),
  {
    ssr: false,
    loading: () => (
      <div className="size-full flex items-center justify-center bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
);

interface SearchResult {
  properties: {
    name: string;
    place_formatted: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface ThirdStepProps extends StepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddressUpdate?: (addressData: any) => void;
}

export function ThirdStep({
  onNext,
  onBack,
  initialData,
  isSubmitting,
  onAddressUpdate,
}: ThirdStepProps) {
  // Get initial coordinates from EXIF data or form data
  const initialLongitude = initialData?.longitude ?? 0;
  const initialLatitude = initialData?.latitude ?? 0;

  // Manage current location state
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: initialLatitude,
    lng: initialLongitude,
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(thirdStepSchema) as any,
    defaultValues: initialData,
    mode: "onChange",
  });

  const { handleSubmit, formState } = form;
  const { isValid } = formState;

  // Get address from coordinates using the hook
  const { data: addressData } = useGetAddress({
    lat: currentLocation?.lat || 0,
    lng: currentLocation?.lng || 0,
  });

  // Update parent component when address data changes
  useEffect(() => {
    if (addressData && onAddressUpdate) {
      onAddressUpdate(addressData);
    }
  }, [addressData, onAddressUpdate]);

  // Auto-search when query changes (with debounce)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Search for places
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
          searchQuery
        )}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a search result
  const handleSelectLocation = (result: SearchResult) => {
    const [lng, lat] = result.geometry.coordinates;
    setCurrentLocation({ lat, lng });
    setSearchResults([]);
    setSearchQuery("");
  };

  // Memoize map values to reduce re-renders
  const mapValues = useMemo(() => {
    const longitude = currentLocation?.lng ?? initialLongitude;
    const latitude = currentLocation?.lat ?? initialLatitude;

    return {
      markers:
        longitude === 0 && latitude === 0
          ? []
          : [
              {
                id: "location",
                longitude,
                latitude,
              },
            ],
      viewState: {
        longitude: longitude || -122.4, // Default to San Francisco
        latitude: latitude || 37.8,
        zoom: longitude === 0 && latitude === 0 ? 2 : 10,
      },
    };
  }, [
    currentLocation?.lat,
    currentLocation?.lng,
    initialLatitude,
    initialLongitude,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    // Include current location in submitted data
    onNext({
      ...data,
      latitude: currentLocation?.lat ?? initialLatitude,
      longitude: currentLocation?.lng ?? initialLongitude,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Search for a place</FormLabel>
          {/* Search Input */}
          <div className="relative mb-2">
            <Input
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 p-0 max-h-[200px] overflow-hidden">
                <ScrollArea className="h-full">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-start gap-2 border-b last:border-b-0"
                      onClick={() => handleSelectLocation(result)}
                    >
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {result.properties.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.properties.place_formatted}
                        </p>
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </Card>
            )}
          </div>

          <FormControl>
            <div className="h-[400px] w-full rounded-md border overflow-hidden">
              <MapboxComponent
                key={`${currentLocation?.lat}-${currentLocation?.lng}`}
                draggableMarker
                markers={mapValues.markers}
                initialViewState={mapValues.viewState}
                onMarkerDragEnd={(data) => {
                  setCurrentLocation({
                    lat: data.lat,
                    lng: data.lng,
                  });
                }}
              />
            </div>
          </FormControl>

          {/* Address Display */}
          <div className="space-y-1 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">
                {currentLocation?.lat && currentLocation?.lng
                  ? formatGPSCoordinates(
                      currentLocation.lat,
                      currentLocation.lng
                    )
                  : "Drag the marker to set location"}
              </span>
            </div>
            {addressData?.features?.[0] && (
              <div className="text-xs">
                📍 {addressData.features[0].properties.place_formatted}
              </div>
            )}
          </div>
        </FormItem>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Feature, FeatureCollection, Point } from "geojson";

export interface MapboxFeature extends Feature {
  geometry: Point;
  properties: {
    full_address: string;
    name: string;
    place_formatted: string;
    context: {
      country: {
        country_code: string;
        name: string;
      };
      locality: {
        name: string;
      } | null;
      place: {
        name: string;
      } | null;
      region: {
        name: string;
      } | null;
    };
  };
}

export interface MapboxReverseGeocodingResponse extends FeatureCollection {
  features: MapboxFeature[];
  query: [number, number];
}

export type AddressData = MapboxReverseGeocodingResponse | null;

interface UseGetLocationProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
}

export const useGetAddress = ({ lat, lng }: UseGetLocationProps) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["mapbox", "reverse-geocoding", lat, lng],
    enabled: lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng),
    queryFn: async ({ signal }): Promise<MapboxReverseGeocodingResponse> => {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=en&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
        { signal },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  return {
    data: data ?? null,
    isLoading: isFetching,
    error: error?.message ?? null,
  };
};

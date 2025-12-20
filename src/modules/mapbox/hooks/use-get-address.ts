import { useState, useEffect } from "react";
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

type LocationState = {
  data: MapboxReverseGeocodingResponse | null;
  isLoading: boolean;
  error: string | null;
};

interface UseGetLocationProps {
  lat: number;
  lng: number;
}

export const useGetAddress = ({ lat, lng }: UseGetLocationProps) => {
  const [state, setState] = useState<LocationState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=en&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MapboxReverseGeocodingResponse = await response.json();
        setState({ data, isLoading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch location",
        });
      }
    };

    fetchLocation();
  }, [lat, lng]);

  return state;
};

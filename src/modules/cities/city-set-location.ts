import { photos } from "@/db/schema";

export interface CitySetLocation {
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
}

export function usesRegionForCitySet(countryCode?: string | null) {
  return countryCode === "JP" || countryCode === "TW";
}

export function getCitySetName(location: CitySetLocation) {
  return usesRegionForCitySet(location.countryCode)
    ? location.region
    : location.city;
}

export function getCitySetPhotoNameColumn(countryCode?: string | null) {
  return usesRegionForCitySet(countryCode) ? photos.region : photos.city;
}

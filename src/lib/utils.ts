import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format GPS coordinates to human-readable string
 * @param lat Latitude in decimal degrees
 * @param lng Longitude in decimal degrees
 * @returns Formatted GPS coordinates string (e.g., "37°47'13.2\"N 122°24'0.0\"W")
 */
export function formatGPSCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): string {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return "No location data";
  }

  // Convert decimal degrees to degrees, minutes, seconds
  const formatCoordinate = (decimal: number, isLatitude: boolean): string => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);

    const direction = isLatitude
      ? decimal >= 0
        ? "N"
        : "S"
      : decimal >= 0
      ? "E"
      : "W";

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return `${formatCoordinate(lat, true)} ${formatCoordinate(lng, false)}`;
}

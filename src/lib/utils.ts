import { Editor } from "@tiptap/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export const NODE_HANDLES_SELECTED_STYLE_CLASSNAME =
  "node-handles-selected-style";

export function isValidUrl(url: string) {
  return /^https?:\/\/\S+$/.test(url);
}

export const duplicateContent = (editor: Editor) => {
  const { view } = editor;
  const { state } = view;
  const { selection } = state;

  editor
    .chain()
    .insertContentAt(
      selection.to,
      selection.content().content.firstChild?.toJSON(),
      {
        updateSelection: true,
      }
    )
    .focus(selection.to)
    .run();
};

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) {
    return str;
  }
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    return null;
  }
}

export interface DiscoverBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

const normalizeLongitude = (longitude: number) =>
  ((((longitude + 180) % 360) + 360) % 360) - 180;
const roundCoordinate = (value: number) => Math.round(value * 1000) / 1000;

export function expandViewportBounds(
  bounds: DiscoverBounds,
  paddingRatio = 0.2,
): DiscoverBounds {
  const rawLongitudeSpan = bounds.east - bounds.west;
  const longitudeSpan = Math.min(
    360,
    rawLongitudeSpan < 0 ? rawLongitudeSpan + 360 : rawLongitudeSpan,
  );
  const latitudeSpan = Math.max(0, bounds.north - bounds.south);
  const latitudePadding = latitudeSpan * paddingRatio;
  const south = Math.max(-85, bounds.south - latitudePadding);
  const north = Math.min(85, bounds.north + latitudePadding);

  if (longitudeSpan * (1 + 2 * paddingRatio) >= 360) {
    return {
      west: -180,
      south: roundCoordinate(south),
      east: 180,
      north: roundCoordinate(north),
    };
  }

  const longitudePadding = longitudeSpan * paddingRatio;
  return {
    west: roundCoordinate(
      normalizeLongitude(bounds.west - longitudePadding),
    ),
    south: roundCoordinate(south),
    east: roundCoordinate(
      normalizeLongitude(bounds.east + longitudePadding),
    ),
    north: roundCoordinate(north),
  };
}

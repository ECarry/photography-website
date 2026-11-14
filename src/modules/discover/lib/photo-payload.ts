export const DISCOVER_MAP_POINT_LIMIT = 500;
export const DISCOVER_DETAILS_PAGE_SIZE = 48;

export function capDiscoverMapPoints<T>(rows: T[]) {
  return {
    photos: rows.slice(0, DISCOVER_MAP_POINT_LIMIT),
    hasMore: rows.length > DISCOVER_MAP_POINT_LIMIT,
  };
}

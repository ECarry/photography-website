const CITY_SET_ID_SUFFIX =
  /--([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function getTravelCityPath(citySetId: string, city: string) {
  const slug =
    city
      .trim()
      .replace(/[\\/]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "city";
  return `/travel/${encodeURIComponent(slug)}--${citySetId}`;
}

export function getTravelCitySetId(routeSegment: string) {
  return routeSegment.match(CITY_SET_ID_SUFFIX)?.[1] ?? null;
}

import Supercluster from "supercluster";
import { DiscoverGetManyPhotos } from "@/modules/discover/types";

export type PhotoPoint = DiscoverGetManyPhotos[number];

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  photos: PhotoPoint[];
}

/**
 * Create a Supercluster index from photos
 */
export function createClusterIndex(photos: PhotoPoint[]) {
  const index = new Supercluster<PhotoPoint>({
    radius: 80, // Cluster radius in pixels
    maxZoom: 16, // Max zoom to cluster points on
    minZoom: 0,
    minPoints: 2, // Minimum points to form a cluster
  });

  // Convert photos to GeoJSON features
  const features: Array<GeoJSON.Feature<GeoJSON.Point, PhotoPoint>> =
    photos.map((photo) => ({
      type: "Feature",
      properties: photo,
      geometry: {
        type: "Point",
        coordinates: [photo.longitude!, photo.latitude!],
      },
    }));

  index.load(features);
  return index;
}

/**
 * Get clusters for current zoom level and bounds
 */
export function getClustersFromIndex(
  index: Supercluster<PhotoPoint>,
  zoom: number,
  bounds: [number, number, number, number]
) {
  const clusters: Cluster[] = [];
  const singlePhotos: PhotoPoint[] = [];

  const clusterData = index.getClusters(bounds, Math.floor(zoom));

  clusterData.forEach((feature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const props = feature.properties;

    // Type guard to check if this is a cluster
    if ("cluster" in props && props.cluster) {
      // This is a cluster
      const clusterId = props.cluster_id as number;
      const pointCount = props.point_count as number;

      // Get all points in this cluster
      const leaves = index.getLeaves(clusterId, Infinity);
      const photos = leaves.map((leaf) => leaf.properties as PhotoPoint);

      clusters.push({
        id: `cluster-${clusterId}`,
        latitude,
        longitude,
        count: pointCount,
        photos,
      });
    } else {
      // This is a single point
      singlePhotos.push(props as PhotoPoint);
    }
  });

  return { clusters, singlePhotos };
}

/**
 * Calculate approximate map bounds based on center and zoom
 */
export function calculateBounds(
  latitude: number,
  longitude: number,
  zoom: number
): [number, number, number, number] {
  const latDelta = 180 / Math.pow(2, zoom);
  const lngDelta = 360 / Math.pow(2, zoom);

  return [
    longitude - lngDelta, // west
    latitude - latDelta, // south
    longitude + lngDelta, // east
    latitude + latDelta, // north
  ];
}

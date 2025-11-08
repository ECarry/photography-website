"use client";

// External dependencies
import * as mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import Map, {
  GeolocateControl,
  Layer,
  LayerProps,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/mapbox";
// Hooks & Types
import MapboxGeocoder, {
  type GeocoderOptions,
} from "@mapbox/mapbox-gl-geocoder";
import { useTheme } from "next-themes";
// Styles
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

export interface MapboxProps {
  id?: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  markers?: Array<{
    id: string;
    longitude: number;
    latitude: number;
    popupContent?: React.ReactNode;
    element?: React.ReactNode;
  }>;
  geoJsonData?: GeoJSON.FeatureCollection;
  onMarkerDragEnd?: (lngLat: { lng: number; lat: number }) => void;
  onGeoJsonClick?: (feature: GeoJSON.Feature) => void;
  onMove?: (viewState: {
    zoom: number;
    latitude: number;
    longitude: number;
  }) => void;
  draggableMarker?: boolean;
  showGeocoder?: boolean;
  showControls?: boolean;
  scrollZoom?: boolean;
  doubleClickZoom?: boolean;
  boxZoom?: boolean;
}

const MAP_STYLES = {
  light: "mapbox://styles/ecarry/cldmhu6tr000001n33ujbxf7j",
  dark: "mapbox://styles/ecarry/clp8hcmd300km01qx78rt0xaw",
} as const;

const Mapbox = ({
  id,
  initialViewState = {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 14,
  },
  markers = [],
  geoJsonData,
  onMarkerDragEnd,
  onGeoJsonClick,
  onMove,
  draggableMarker = false,
  showGeocoder = false,
  showControls = true,
  scrollZoom = true,
  doubleClickZoom = true,
  boxZoom = true,
}: MapboxProps) => {
  const mapRef = useRef<MapRef>(null);
  const { theme } = useTheme();
  const [popupInfo, setPopupInfo] = useState<{
    id: string;
    longitude: number;
    latitude: number;
    content: React.ReactNode;
  } | null>(null);

  // GeoJSON layer style for visited countries
  const layerStyle: LayerProps = {
    id: "data",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["get", "visited"],
        theme === "dark" ? "#3b82f6" : "#2563eb", // Blue color for visited countries
        "#0080ff", // Default color for non-visited
      ],
      "fill-opacity": [
        "case",
        ["get", "visited"],
        0.6, // Higher opacity for visited countries
        0.2, // Lower opacity for non-visited
      ],
    },
  };

  // Add stroke layer for visited countries
  const strokeLayerStyle: LayerProps = {
    id: "data-stroke",
    type: "line",
    paint: {
      "line-color": [
        "case",
        ["get", "visited"],
        theme === "dark" ? "#3b82f6" : "#2563eb", // Blue color for visited countries
        "transparent",
      ],
      "line-width": 2,
      "line-opacity": 0.8,
    },
  };

  // Add Geocoder control
  useEffect(() => {
    if (!showGeocoder || !mapRef.current) return;

    const map = mapRef.current;
    const geocoderOptions: GeocoderOptions = {
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
      mapboxgl: mapboxgl,
    };
    const geocoder = new MapboxGeocoder(geocoderOptions);

    map.getMap().addControl(geocoder);

    return () => {
      if (map) {
        map.getMap().removeControl(geocoder);
      }
    };
  }, [showGeocoder]);

  // Handle GeoJSON click
  const onClick = useCallback(
    (
      event: mapboxgl.MapMouseEvent & {
        features?: mapboxgl.GeoJSONFeature[];
      }
    ) => {
      if (!onGeoJsonClick) return;

      const feature = event.features?.[0];
      if (feature) {
        onGeoJsonClick(feature as GeoJSON.Feature);
      }
    },
    [onGeoJsonClick]
  );

  // Fly to location
  const flyToLocation = useCallback((longitude: number, latitude: number) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      duration: 2000,
      zoom: 14,
    });
  }, []);

  return (
    <Map
      id={id}
      ref={mapRef}
      scrollZoom={scrollZoom}
      doubleClickZoom={doubleClickZoom}
      boxZoom={boxZoom}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLES[theme === "dark" ? "dark" : "light"]}
      interactiveLayerIds={geoJsonData ? ["data"] : undefined}
      onClick={onClick}
      onMove={(evt) => {
        if (onMove) {
          onMove({
            zoom: evt.viewState.zoom,
            latitude: evt.viewState.latitude,
            longitude: evt.viewState.longitude,
          });
        }
      }}
    >
      {/* Navigation Controls */}
      {showControls && <NavigationControl position="bottom-left" />}
      {/* Show location button */}
      {showControls && (
        <GeolocateControl
          position="bottom-left"
          trackUserLocation
          onGeolocate={(e) => {
            flyToLocation(e.coords.longitude, e.coords.latitude);
          }}
        />
      )}
      {/* Markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.longitude}
          latitude={marker.latitude}
          draggable={draggableMarker}
          style={{ cursor: draggableMarker ? "grab" : "pointer" }}
          onDragEnd={
            onMarkerDragEnd ? (e) => onMarkerDragEnd(e.lngLat) : undefined
          }
          onClick={() => {
            if (marker.popupContent) {
              setPopupInfo({
                id: marker.id,
                longitude: marker.longitude,
                latitude: marker.latitude,
                content: marker.popupContent,
              });
            }
          }}
        >
          {marker.element}
        </Marker>
      ))}

      {/* Popup */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          anchor="bottom"
          offset={15}
          className="p-0! rounded-xl! overflow-hidden max-w-none"
          closeButton={false}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
        >
          <div className="relative">
            <button
              onClick={() => setPopupInfo(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            {popupInfo.content}
          </div>
        </Popup>
      )}

      {/* GeoJSON Layer */}
      {geoJsonData && (
        <Source type="geojson" data={geoJsonData}>
          <Layer {...layerStyle} />
          <Layer {...strokeLayerStyle} />
        </Source>
      )}
    </Map>
  );
};

export default Mapbox;

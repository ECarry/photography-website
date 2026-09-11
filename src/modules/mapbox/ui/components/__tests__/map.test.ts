import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Mapbox, { type MapboxProps } from "../map";

type MarkerProps = {
  longitude: number;
  latitude: number;
  draggable: boolean;
  onDragEnd: (event: { lngLat: { lng: number; lat: number } }) => void;
};

const captured = vi.hoisted(() => ({ markers: [] as MarkerProps[] }));

vi.unmock("react");
vi.mock("mapbox-gl", () => ({}));
vi.mock("@mapbox/mapbox-gl-geocoder", () => ({ default: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light" }) }));
vi.mock("react-map-gl/mapbox", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
  Marker: (props: MarkerProps) => {
    captured.markers.push(props);
    return null;
  },
  NavigationControl: () => null,
  GeolocateControl: () => null,
  Layer: () => null,
  Source: () => null,
}));

beforeEach(() => {
  vi.stubGlobal("React", React);
  captured.markers = [];
});
afterEach(() => vi.unstubAllGlobals());

function render(props: MapboxProps) {
  renderToStaticMarkup(React.createElement(Mapbox, props));
}

describe("editable map without coordinates", () => {
  it("shows a draggable marker at the initial map center", () => {
    render({ draggableMarker: true, markers: [], initialViewState: { longitude: 116.4, latitude: 39.9, zoom: 2 } });
    expect(captured.markers).toHaveLength(1);
    expect(captured.markers[0]).toMatchObject({ longitude: 116.4, latitude: 39.9, draggable: true });
  });

  it("does not save the temporary location until the marker is dragged", () => {
    const onMarkerDragEnd = vi.fn();
    render({ draggableMarker: true, onMarkerDragEnd });
    expect(onMarkerDragEnd).not.toHaveBeenCalled();
    expect(captured.markers).toHaveLength(1);
    captured.markers[0].onDragEnd({ lngLat: { lng: 0, lat: 0 } });
    expect(onMarkerDragEnd).toHaveBeenCalledWith("location", { lng: 0, lat: 0 });
  });

  it("uses the default map center when no initial view is provided", () => {
    render({ draggableMarker: true });
    expect(captured.markers[0]).toMatchObject({ longitude: -122.4, latitude: 37.8 });
  });

  it("preserves real markers, including zero coordinates", () => {
    render({ draggableMarker: true, markers: [{ id: "photo", longitude: 0, latitude: 0 }] });
    expect(captured.markers).toHaveLength(1);
    expect(captured.markers[0]).toMatchObject({ longitude: 0, latitude: 0 });
  });

  it("does not create temporary markers on read-only maps", () => {
    render({ markers: [] });
    expect(captured.markers).toHaveLength(0);
  });
});

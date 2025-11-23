"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";
import { MapPin, Plus, X } from "lucide-react";
import type { MapboxMarker } from "../extensions/mapbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Mapbox = dynamic(() => import("@/modules/mapbox/ui/components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export const MapboxToolbar = React.forwardRef<HTMLButtonElement>((_, ref) => {
  const { editor } = useToolbar();
  const [isOpen, setIsOpen] = useState(false);
  const [markers, setMarkers] = useState<MapboxMarker[]>([
    {
      id: "marker-1",
      longitude: -122.4194,
      latitude: 37.7749,
      label: "Location 1",
    },
  ]);
  const [zoom, setZoom] = useState("12");
  const [enableZoom, setEnableZoom] = useState(true);
  const [enableScroll, setEnableScroll] = useState(true);
  const [enableDrag, setEnableDrag] = useState(true);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isActive: ctx.editor.isActive("mapbox") ?? false,
      canMapbox: ctx.editor.can().chain().focus().run() ?? false,
    }),
  });

  const addMarker = () => {
    const newId = `marker-${markers.length + 1}`;
    const lastMarker = markers[markers.length - 1];
    setMarkers([
      ...markers,
      {
        id: newId,
        longitude: lastMarker?.longitude || -122.4194,
        latitude: lastMarker?.latitude || 37.7749,
        label: `Location ${markers.length + 1}`,
      },
    ]);
  };

  const addMap = () => {
    const z = parseInt(zoom);

    if (isNaN(z)) {
      return;
    }

    // Validate all markers
    const validMarkers = markers.filter(
      (m) => !isNaN(m.longitude) && !isNaN(m.latitude)
    );

    if (validMarkers.length === 0) {
      return;
    }

    console.log("MapboxToolbar - Inserting markers:", validMarkers);

    editor
      .chain()
      .focus()
      .setMapbox({
        markers: validMarkers,
        zoom: z,
        scrollZoom: enableScroll,
        doubleClickZoom: enableZoom,
        dragRotate: enableDrag,
      })
      .run();

    setIsOpen(false);
    setMarkers([
      {
        id: "marker-1",
        longitude: -122.4194,
        latitude: 37.7749,
        label: "Location 1",
      },
    ]);
    setZoom("12");
    setEnableZoom(true);
    setEnableScroll(true);
    setEnableDrag(true);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            ref={ref}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!editorState.canMapbox}
            onClick={() => setIsOpen(true)}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Map</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insert Mapbox Map</DialogTitle>
            <DialogDescription>
              Drag markers to set coordinates. Use search to find locations.
            </DialogDescription>
          </DialogHeader>

          {/* Map Preview */}
          <div className="h-[450px] w-full rounded-md overflow-hidden border">
            <Mapbox
              initialViewState={{
                longitude: markers[0]?.longitude || -122.4194,
                latitude: markers[0]?.latitude || 37.7749,
                zoom: parseInt(zoom),
              }}
              markers={markers}
              draggableMarker={true}
              showGeocoder={true}
              showControls={enableScroll || enableZoom || enableDrag}
              scrollZoom={enableScroll}
              doubleClickZoom={enableZoom}
              dragRotate={enableDrag}
              dragPan={enableDrag}
              onMarkerDragEnd={(markerId, lngLat) => {
                // Update the dragged marker
                setMarkers(
                  markers.map((m) =>
                    m.id === markerId
                      ? { ...m, longitude: lngLat.lng, latitude: lngLat.lat }
                      : m
                  )
                );
              }}
              onMove={(viewState) => {
                setZoom(Math.round(viewState.zoom).toString());
              }}
            />
          </div>

          {/* Controls */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Markers: {markers.length}
              </Label>
              <div className="flex gap-2">
                {markers.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (markers.length > 1) {
                        setMarkers(markers.slice(0, -1));
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove Last
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addMarker}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Marker
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoom">Zoom Level</Label>
              <Input
                id="zoom"
                type="number"
                min="0"
                max="22"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                placeholder="12"
              />
            </div>

            {/* Interaction Controls */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm font-medium">Map Interactions</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableScroll"
                  checked={enableScroll}
                  onCheckedChange={(checked) =>
                    setEnableScroll(checked as boolean)
                  }
                />
                <Label
                  htmlFor="enableScroll"
                  className="text-sm font-normal cursor-pointer"
                >
                  Enable scroll zoom
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableZoom"
                  checked={enableZoom}
                  onCheckedChange={(checked) =>
                    setEnableZoom(checked as boolean)
                  }
                />
                <Label
                  htmlFor="enableZoom"
                  className="text-sm font-normal cursor-pointer"
                >
                  Enable double click zoom
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableDrag"
                  checked={enableDrag}
                  onCheckedChange={(checked) =>
                    setEnableDrag(checked as boolean)
                  }
                />
                <Label
                  htmlFor="enableDrag"
                  className="text-sm font-normal cursor-pointer"
                >
                  Enable drag/pan map
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={addMap}>
              Insert Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

MapboxToolbar.displayName = "MapboxToolbar";

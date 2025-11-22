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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";

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
  const [longitude, setLongitude] = useState("-122.4194");
  const [latitude, setLatitude] = useState("37.7749");
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

  const addMap = () => {
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const z = parseInt(zoom);

    if (isNaN(lng) || isNaN(lat) || isNaN(z)) {
      return;
    }

    editor
      .chain()
      .focus()
      .setMapbox({
        longitude: lng,
        latitude: lat,
        zoom: z,
        scrollZoom: enableScroll,
        doubleClickZoom: enableZoom,
        dragRotate: enableDrag,
      })
      .run();

    setIsOpen(false);
    setLongitude("-122.4194");
    setLatitude("37.7749");
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Insert Mapbox Map</DialogTitle>
            <DialogDescription>
              Search for a location, drag the marker, or move the map to select
              coordinates and configure interaction options.
            </DialogDescription>
          </DialogHeader>

          {/* Map Preview */}
          <div className="h-[400px] w-full rounded-md overflow-hidden border">
            <Mapbox
              initialViewState={{
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude),
                zoom: parseInt(zoom),
              }}
              markers={[
                {
                  id: "preview",
                  longitude: parseFloat(longitude),
                  latitude: parseFloat(latitude),
                },
              ]}
              draggableMarker={true}
              showGeocoder={true}
              showControls={enableScroll || enableZoom || enableDrag}
              scrollZoom={enableScroll}
              doubleClickZoom={enableZoom}
              dragRotate={enableDrag}
              dragPan={enableDrag}
              onMarkerDragEnd={(lngLat) => {
                setLongitude(lngLat.lng.toFixed(6));
                setLatitude(lngLat.lat.toFixed(6));
              }}
              onMove={(viewState) => {
                setZoom(Math.round(viewState.zoom).toString());
              }}
            />
          </div>

          {/* Coordinates Input */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-122.4194"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="37.7749"
                />
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

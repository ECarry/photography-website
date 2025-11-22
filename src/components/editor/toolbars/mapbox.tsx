"use client";

import React, { useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";

export const MapboxToolbar = React.forwardRef<HTMLButtonElement>((_, ref) => {
  const { editor } = useToolbar();
  const [isOpen, setIsOpen] = useState(false);
  const [longitude, setLongitude] = useState("-122.4194");
  const [latitude, setLatitude] = useState("37.7749");
  const [zoom, setZoom] = useState("12");

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
      })
      .run();

    setIsOpen(false);
    setLongitude("-122.4194");
    setLatitude("37.7749");
    setZoom("12");
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Mapbox Map</DialogTitle>
            <DialogDescription>
              Enter the coordinates and zoom level for the map location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="col-span-3"
                placeholder="-122.4194"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="col-span-3"
                placeholder="37.7749"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zoom" className="text-right">
                Zoom
              </Label>
              <Input
                id="zoom"
                type="number"
                min="0"
                max="22"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="col-span-3"
                placeholder="12"
              />
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

"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn, duplicateContent } from "@/lib/utils";

const Mapbox = dynamic(() => import("@/modules/mapbox/ui/components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export interface MapboxOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface MapboxMarker {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mapbox: {
      setMapbox: (options: {
        markers: MapboxMarker[];
        zoom?: number;
        scrollZoom?: boolean;
        doubleClickZoom?: boolean;
        dragRotate?: boolean;
      }) => ReturnType;
    };
  }
}

export const MapboxExtension = Node.create<MapboxOptions>({
  name: "mapbox",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      markers: {
        default: [
          {
            id: "marker-1",
            longitude: -122.4194,
            latitude: 37.7749,
            label: "Location 1",
          },
        ],
        parseHTML: (element) => {
          const markersStr = element.getAttribute("data-markers");
          if (!markersStr) return [];
          try {
            const parsed = JSON.parse(markersStr);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.markers) return {};
          return {
            "data-markers": JSON.stringify(attributes.markers),
          };
        },
      },
      zoom: {
        default: 12,
        parseHTML: (element) => {
          return parseInt(element.getAttribute("data-zoom") || "12");
        },
        renderHTML: (attributes) => {
          return {
            "data-zoom": attributes.zoom,
          };
        },
      },
      width: {
        default: "100%",
      },
      height: {
        default: "400px",
      },
      align: {
        default: "center",
      },
      scrollZoom: {
        default: true,
        parseHTML: (element) => {
          return element.getAttribute("data-scroll-zoom") === "true";
        },
        renderHTML: (attributes) => {
          return {
            "data-scroll-zoom": attributes.scrollZoom,
          };
        },
      },
      doubleClickZoom: {
        default: true,
        parseHTML: (element) => {
          return element.getAttribute("data-double-click-zoom") === "true";
        },
        renderHTML: (attributes) => {
          return {
            "data-double-click-zoom": attributes.doubleClickZoom,
          };
        },
      },
      dragRotate: {
        default: true,
        parseHTML: (element) => {
          return element.getAttribute("data-drag-rotate") === "true";
        },
        renderHTML: (attributes) => {
          return {
            "data-drag-rotate": attributes.dragRotate,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='mapbox']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "mapbox",
      }),
    ];
  },

  addCommands() {
    return {
      setMapbox:
        (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                markers: options.markers || [],
                zoom: options.zoom || 12,
                scrollZoom:
                  options.scrollZoom !== undefined ? options.scrollZoom : true,
                doubleClickZoom:
                  options.doubleClickZoom !== undefined
                    ? options.doubleClickZoom
                    : true,
                dragRotate:
                  options.dragRotate !== undefined ? options.dragRotate : true,
              },
            });
          },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapMapbox);
  },
});

function TiptapMapbox(props: NodeViewProps) {
  const { node, editor, selected, deleteNode, updateAttributes } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [resizingPosition, setResizingPosition] = useState<"left" | "right">(
    "left"
  );
  const [resizeInitialWidth, setResizeInitialWidth] = useState(0);
  const [resizeInitialMouseX, setResizeInitialMouseX] = useState(0);
  const [openedMore, setOpenedMore] = useState(false);

  // Calculate initial view state based on markers
  const initialViewState = useMemo(() => {
    const markers = Array.isArray(node.attrs.markers) ? node.attrs.markers : [];


    if (markers.length > 0) {
      return {
        longitude: markers[0].longitude,
        latitude: markers[0].latitude,
        zoom: node.attrs.zoom,
      };
    }
    return {
      longitude: -122.4194,
      latitude: 37.7749,
      zoom: node.attrs.zoom,
    };
  }, [node.attrs]);

  const handleDelete = useCallback(() => {
    deleteNode();
  }, [deleteNode]);

  function handleResizingPosition({
    e,
    position,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    position: "left" | "right";
  }) {
    startResize(e);
    setResizingPosition(position);
  }

  function startResize(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setResizing(true);
    setResizeInitialMouseX(event.clientX);
    if (containerRef.current) {
      setResizeInitialWidth(containerRef.current.offsetWidth);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function resize(event: MouseEvent) {
    if (!resizing) return;

    let dx = event.clientX - resizeInitialMouseX;
    if (resizingPosition === "left") {
      dx = resizeInitialMouseX - event.clientX;
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 300);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth || 0;

    if (newWidth < parentWidth) {
      updateAttributes({ width: newWidth });
    }
  }

  function endResize() {
    setResizing(false);
    setResizeInitialMouseX(0);
    setResizeInitialWidth(0);
  }

  function handleTouchStart(
    event: React.TouchEvent,
    position: "left" | "right"
  ) {
    event.preventDefault();
    setResizing(true);
    setResizingPosition(position);
    setResizeInitialMouseX(event.touches[0].clientX);
    if (containerRef.current) {
      setResizeInitialWidth(containerRef.current.offsetWidth);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleTouchMove(event: TouchEvent) {
    if (!resizing) return;

    let dx = event.touches[0].clientX - resizeInitialMouseX;
    if (resizingPosition === "left") {
      dx = resizeInitialMouseX - event.touches[0].clientX;
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 300);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth || 0;

    if (newWidth < parentWidth) {
      updateAttributes({ width: newWidth });
    }
  }

  function handleTouchEnd() {
    setResizing(false);
    setResizeInitialMouseX(0);
    setResizeInitialWidth(0);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", endResize);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", endResize);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    resizing,
    resizeInitialMouseX,
    resizeInitialWidth,
    resize,
    handleTouchMove,
  ]);

  return (
    <NodeViewWrapper
      ref={nodeRef}
      className={cn(
        "relative flex flex-col rounded-md border-2 border-transparent",
        selected ? "border-blue-300" : "",
        node.attrs.align === "left" && "left-0 translate-x-0",
        node.attrs.align === "center" && "left-1/2 -translate-x-1/2",
        node.attrs.align === "right" && "left-full -translate-x-full"
      )}
      style={{ width: node.attrs.width, maxWidth: "100%" }}
    >
      <div
        ref={containerRef}
        className={cn(
          "group relative flex flex-col rounded-md overflow-hidden bg-muted",
          resizing && ""
        )}
        style={{ height: node.attrs.height }}
      >
        <Mapbox
          initialViewState={initialViewState}
          markers={Array.isArray(node.attrs.markers) ? node.attrs.markers : []}
          showControls={
            editor?.isEditable
              ? false
              : node.attrs.scrollZoom ||
              node.attrs.doubleClickZoom ||
              node.attrs.dragRotate
          }
          scrollZoom={editor?.isEditable ? false : node.attrs.scrollZoom}
          doubleClickZoom={
            editor?.isEditable ? false : node.attrs.doubleClickZoom
          }
          dragRotate={editor?.isEditable ? false : node.attrs.dragRotate}
          dragPan={editor?.isEditable ? false : node.attrs.dragRotate}
        />

        {/* Overlay to capture clicks when selected or resizing */}
        {editor?.isEditable && <div className="absolute inset-0 z-10" />}

        <figcaption className="text-center bg-background/80 backdrop-blur-sm">
          <NodeViewContent />
        </figcaption>

        {editor?.isEditable && (
          <>
            <div
              className="absolute inset-y-0 z-20 flex w-[25px] cursor-col-resize items-center justify-start p-2"
              style={{ left: 0 }}
              onMouseDown={(event) => {
                handleResizingPosition({ e: event, position: "left" });
              }}
              onTouchStart={(event) => handleTouchStart(event, "left")}
            >
              <div className="z-20 h-[70px] w-1 rounded-xl border bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100" />
            </div>
            <div
              className="absolute inset-y-0 z-20 flex w-[25px] cursor-col-resize items-center justify-end p-2"
              style={{ right: 0 }}
              onMouseDown={(event) => {
                handleResizingPosition({ e: event, position: "right" });
              }}
              onTouchStart={(event) => handleTouchStart(event, "right")}
            >
              <div className="z-20 h-[70px] w-1 rounded-xl border bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100" />
            </div>
            <div
              className={cn(
                "absolute right-4 top-4 flex items-center gap-1 rounded-md border bg-background p-1 opacity-0 transition-opacity z-30",
                !resizing && "group-hover:opacity-100",
                openedMore && "opacity-100"
              )}
            >
              <Button
                type="button"
                size="icon"
                className={cn(
                  "size-7",
                  node.attrs.align === "left" && "bg-accent"
                )}
                variant="ghost"
                onClick={() => {
                  updateAttributes({
                    align: "left",
                  });
                }}
              >
                <AlignLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                className={cn(
                  "size-7",
                  node.attrs.align === "center" && "bg-accent"
                )}
                variant="ghost"
                onClick={() => {
                  updateAttributes({
                    align: "center",
                  });
                }}
              >
                <AlignCenter className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                className={cn(
                  "size-7",
                  node.attrs.align === "right" && "bg-accent"
                )}
                variant="ghost"
                onClick={() => {
                  updateAttributes({
                    align: "right",
                  });
                }}
              >
                <AlignRight className="size-4" />
              </Button>
              <Separator orientation="vertical" className="h-[20px]" />
              <DropdownMenu
                open={openedMore}
                onOpenChange={(val) => {
                  setOpenedMore(val);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="size-7"
                    variant="ghost"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  alignOffset={-90}
                  className="mt-1 text-sm"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      duplicateContent(editor);
                    }}
                  >
                    <Copy className="mr-2 size-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash className="mr-2 size-4" /> Delete Map
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

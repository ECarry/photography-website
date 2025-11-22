"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToolbar } from "./toolbar-provider";
import { Check, Highlighter } from "lucide-react";
import { useEditorState } from "@tiptap/react";

const HIGHLIGHT_COLORS = [
  { name: "Default", color: "var(--highlight-default)" },
  { name: "Gray", color: "var(--highlight-gray)" },
  { name: "Brown", color: "var(--highlight-brown)" },
  { name: "Orange", color: "var(--highlight-orange)" },
  { name: "Yellow", color: "var(--highlight-yellow)" },
  { name: "Green", color: "var(--highlight-green)" },
  { name: "Blue", color: "var(--highlight-blue)" },
  { name: "Purple", color: "var(--highlight-purple)" },
  { name: "Pink", color: "var(--highlight-pink)" },
  { name: "Red", color: "var(--highlight-red)" },
];

interface HighlightButtonProps {
  name: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const HighlightButton = ({
  name,
  color,
  isActive,
  onClick,
}: HighlightButtonProps) => (
  <button
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
    type="button"
  >
    <div className="flex items-center space-x-2">
      <div
        className="rounded-sm border px-1 py-px font-medium"
        style={{ backgroundColor: color }}
      >
        A
      </div>
      <span>{name}</span>
    </div>
    {isActive && <Check className="h-4 w-4" />}
  </button>
);

export const HighlightToolbar = () => {
  const { editor } = useToolbar();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      currentHighlight: ctx.editor.getAttributes("highlight").color,
      isDisabled: !ctx.editor.can().chain().setHighlight().run(),
    }),
  });

  const handleSetHighlight = (color: string) => {
    editor
      .chain()
      .focus()
      .setHighlight(
        color === editorState.currentHighlight ? { color: "" } : { color }
      )
      .run();
  };

  return (
    <Popover>
      <div className="relative h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger disabled={editorState.isDisabled} asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                style={
                  editorState.currentHighlight
                    ? { backgroundColor: editorState.currentHighlight }
                    : undefined
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Highlight</TooltipContent>
        </Tooltip>

        <PopoverContent
          align="start"
          className="w-56 p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ScrollArea className="max-h-80 overflow-y-auto pr-2">
            <div className="mb-2.5 mt-2 px-2 text-xs text-muted-foreground">
              Background
            </div>
            {HIGHLIGHT_COLORS.map(({ name, color }) => (
              <HighlightButton
                key={name}
                name={name}
                color={color}
                isActive={editorState.currentHighlight === color}
                onClick={() => handleSetHighlight(color)}
              />
            ))}
          </ScrollArea>
        </PopoverContent>
      </div>
    </Popover>
  );
};

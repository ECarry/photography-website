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
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";
import { Check, ChevronDown } from "lucide-react";
import { useEditorState } from "@tiptap/react";

const TEXT_COLORS = [
  { name: "Default", color: "var(--text-default)" },
  { name: "Gray", color: "var(--text-gray)" },
  { name: "Brown", color: "var(--text-brown)" },
  { name: "Orange", color: "var(--text-orange)" },
  { name: "Yellow", color: "var(--text-yellow)" },
  { name: "Green", color: "var(--text-green)" },
  { name: "Blue", color: "var(--text-blue)" },
  { name: "Purple", color: "var(--text-purple)" },
  { name: "Pink", color: "var(--text-pink)" },
  { name: "Red", color: "var(--text-red)" },
];

interface ColorButtonProps {
  name: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const ColorButton = ({ name, color, isActive, onClick }: ColorButtonProps) => (
  <button
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
    type="button"
  >
    <div className="flex items-center space-x-2">
      <div
        className="rounded-sm border px-1 py-px font-medium"
        style={{ color }}
      >
        A
      </div>
      <span>{name}</span>
    </div>
    {isActive && <Check className="h-4 w-4" />}
  </button>
);

export const ColorToolbar = () => {
  const { editor } = useToolbar();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      currentColor: ctx.editor.getAttributes("textStyle").color,
      isDisabled: !ctx.editor.can().chain().setColor("").run(),
    }),
  });

  const handleSetColor = (color: string) => {
    editor
      .chain()
      .focus()
      .setColor(color === editorState.currentColor ? "" : color)
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
                size="sm"
                style={{
                  color: editorState.currentColor,
                }}
                className={cn("h-8 w-14 p-0 font-normal")}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-md">A</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Text Color</TooltipContent>
        </Tooltip>

        <PopoverContent
          align="start"
          className="w-56 p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ScrollArea className="max-h-80 overflow-y-auto pr-2">
            <div className="mb-2.5 mt-2 px-2 text-xs text-muted-foreground">
              Color
            </div>
            {TEXT_COLORS.map(({ name, color }) => (
              <ColorButton
                key={name}
                name={name}
                color={color}
                isActive={editorState.currentColor === color}
                onClick={() => handleSetColor(color)}
              />
            ))}
          </ScrollArea>
        </PopoverContent>
      </div>
    </Popover>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";

const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "Extra Large", value: "24px" },
  { label: "Huge", value: "32px" },
];

export const FontSizeToolbar = () => {
  const { editor } = useToolbar();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      currentFontSize: ctx.editor.getAttributes("textStyle").fontSize || "16px",
      isDisabled: !ctx.editor.can().chain().setFontSize("16px").run(),
    }),
  });

  const handleSetFontSize = (fontSize: string) => {
    editor.chain().focus().setFontSize(fontSize).run();
  };

  // 获取当前字体大小的数值（去掉 px 单位）
  const currentSize = editorState.currentFontSize.replace("px", "");

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger disabled={editorState.isDisabled} asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-8 w-14 px-2 gap-0.5 font-normal")}
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className="text-xs font-medium">{currentSize}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Font Size</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="start"
        className="w-40 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {FONT_SIZES.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSetFontSize(value)}
            className={cn(
              "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
              editorState.currentFontSize === value &&
                "bg-accent text-accent-foreground"
            )}
          >
            <span style={{ fontSize: value }}>{label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

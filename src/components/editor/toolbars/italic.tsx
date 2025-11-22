"use client";

import { ItalicIcon } from "lucide-react";
import React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";

const ItalicToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      }),
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editorState.isItalic && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor.chain().focus().toggleItalic().run();
              onClick?.(e);
            }}
            disabled={!editorState.canItalic}
            ref={ref}
            {...props}
          >
            {children || <ItalicIcon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Italic</span>
          <span className="ml-1 text-xs text-gray-11">(cmd + i)</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

ItalicToolbar.displayName = "ItalicToolbar";

export { ItalicToolbar };

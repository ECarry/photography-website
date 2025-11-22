"use client";

import { TextQuote } from "lucide-react";
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

const BlockquoteToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        canBlockquote:
          ctx.editor.can().chain().toggleBlockquote().run() ?? false,
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
              editorState.isBlockquote && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor.chain().focus().toggleBlockquote().run();
              onClick?.(e);
            }}
            disabled={!editorState.canBlockquote}
            ref={ref}
            {...props}
          >
            {children || <TextQuote className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Blockquote</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

BlockquoteToolbar.displayName = "BlockquoteToolbar";

export { BlockquoteToolbar };

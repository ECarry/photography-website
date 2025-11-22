"use client";

import { CornerUpRight } from "lucide-react";
import React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/editor/toolbars/toolbar-provider";
import { useEditorState } from "@tiptap/react";

const RedoToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }),
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", className)}
            onClick={(e) => {
              editor.chain().focus().redo().run();
              onClick?.(e);
            }}
            disabled={!editorState.canRedo}
            ref={ref}
            {...props}
          >
            {children || <CornerUpRight className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Redo</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

RedoToolbar.displayName = "RedoToolbar";

export { RedoToolbar };

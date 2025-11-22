"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/editor/toolbars/toolbar-provider";
import { CornerUpLeft } from "lucide-react";
import React from "react";
import { useEditorState } from "@tiptap/react";

const UndoToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
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
              editor.chain().focus().undo().run();
              onClick?.(e);
            }}
            disabled={!editorState.canUndo}
            ref={ref}
            {...props}
          >
            {children || <CornerUpLeft className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Undo</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

UndoToolbar.displayName = "UndoToolbar";

export { UndoToolbar };

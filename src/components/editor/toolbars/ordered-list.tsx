"use client";

import { ListOrdered } from "lucide-react";
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

const OrderedListToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        canOrderedList:
          ctx.editor.can().chain().toggleOrderedList().run() ?? false,
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
              editorState.isOrderedList && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor.chain().focus().toggleOrderedList().run();
              onClick?.(e);
            }}
            disabled={!editorState.canOrderedList}
            ref={ref}
            {...props}
          >
            {children || <ListOrdered className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Ordered list</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

OrderedListToolbar.displayName = "OrderedListToolbar";

export { OrderedListToolbar };

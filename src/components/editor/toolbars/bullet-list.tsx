"use client";

import { List } from "lucide-react";
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

const BulletListToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        canBulletList:
          ctx.editor.can().chain().toggleBulletList().run() ?? false,
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
              editorState.isBulletList && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor.chain().focus().toggleBulletList().run();
              onClick?.(e);
            }}
            disabled={!editorState.canBulletList}
            ref={ref}
            {...props}
          >
            {children || <List className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Bullet list</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

BulletListToolbar.displayName = "BulletListToolbar";

export { BulletListToolbar };

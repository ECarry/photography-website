"use client";

import { Heading1Icon, Heading2Icon, Heading3Icon } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeadingLevel = 1 | 2 | 3;

const HeadingToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { editor } = useToolbar();

    const editorState = useEditorState({
      editor,
      selector: (ctx) => ({
        isH1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isH2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isH3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        canHeading:
          ctx.editor.can().chain().focus().toggleHeading({ level: 1 }).run() ??
          false,
      }),
    });

    const setHeading = (level: HeadingLevel) => {
      editor.chain().focus().toggleHeading({ level }).run();
    };

    const isActive = editorState.isH1 || editorState.isH2 || editorState.isH3;

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isActive && "bg-accent", className)}
                disabled={!editorState.canHeading}
                ref={ref}
                {...props}
              >
                {editorState.isH1 ? (
                  <Heading1Icon className="h-4 w-4" />
                ) : editorState.isH2 ? (
                  <Heading2Icon className="h-4 w-4" />
                ) : editorState.isH3 ? (
                  <Heading3Icon className="h-4 w-4" />
                ) : (
                  <Heading1Icon className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => setHeading(1)}
            className={cn(
              "flex items-center gap-2",
              editorState.isH1 && "bg-accent"
            )}
          >
            <Heading1Icon className="h-4 w-4" />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setHeading(2)}
            className={cn(
              "flex items-center gap-2",
              editorState.isH2 && "bg-accent"
            )}
          >
            <Heading2Icon className="h-4 w-4" />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setHeading(3)}
            className={cn(
              "flex items-center gap-2",
              editorState.isH3 && "bg-accent"
            )}
          >
            <Heading3Icon className="h-4 w-4" />
            <span>Heading 3</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

HeadingToolbar.displayName = "HeadingToolbar";

export { HeadingToolbar };

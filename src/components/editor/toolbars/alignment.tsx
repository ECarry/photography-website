"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";

export const AlignmentToolbar = () => {
  const { editor } = useToolbar();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      let currentAlign = "left";
      if (ctx.editor.isActive({ textAlign: "left" })) {
        currentAlign = "left";
      } else if (ctx.editor.isActive({ textAlign: "center" })) {
        currentAlign = "center";
      } else if (ctx.editor.isActive({ textAlign: "right" })) {
        currentAlign = "right";
      } else if (ctx.editor.isActive({ textAlign: "justify" })) {
        currentAlign = "justify";
      }

      return {
        isDisabled:
          ctx.editor.isActive("image") || ctx.editor.isActive("video"),
        currentTextAlign: currentAlign,
      };
    },
  });

  const handleAlign = (value: string) => {
    editor.chain().focus().setTextAlign(value).run();
  };

  const alignmentOptions = [
    {
      name: "Left Align",
      value: "left",
      icon: <AlignLeft className="h-4 w-4" />,
    },
    {
      name: "Center Align",
      value: "center",
      icon: <AlignCenter className="h-4 w-4" />,
    },
    {
      name: "Right Align",
      value: "right",
      icon: <AlignRight className="h-4 w-4" />,
    },
    {
      name: "Justify Align",
      value: "justify",
      icon: <AlignJustify className="h-4 w-4" />,
    },
  ];

  const findIndex = (value: string) => {
    return alignmentOptions.findIndex((option) => option.value === value);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger disabled={editorState.isDisabled} asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-max font-normal"
              type="button"
            >
              <span className="mr-2">
                {alignmentOptions[findIndex(editorState.currentTextAlign)].icon}
              </span>
              {alignmentOptions[findIndex(editorState.currentTextAlign)].name}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Text Alignment</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        loop
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DropdownMenuGroup className=" w-40">
          {alignmentOptions.map((option, index) => (
            <DropdownMenuItem
              onSelect={() => {
                handleAlign(option.value);
              }}
              key={index}
            >
              <span className="mr-2">{option.icon}</span>
              {option.name}

              {option.value === editorState.currentTextAlign && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

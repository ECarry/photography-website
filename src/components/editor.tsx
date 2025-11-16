"use client";

import { Separator } from "@/components/ui/separator";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageExtension } from "./extensions/image";
import { ImagePlaceholder } from "./extensions/image-placeholder";
import SearchAndReplace from "./extensions/search-and-replace";
import { TextStyle } from "@tiptap/extension-text-style";
import { Subscript, Superscript } from "lucide-react";
import { ToolbarProvider } from "./toolbars/toolbar-provider";
import { RedoToolbar } from "./toolbars/redo";
import { BoldToolbar } from "./toolbars/bold";
import { ItalicToolbar } from "./toolbars/italic";
import { BulletListToolbar } from "./toolbars/bullet-list";
import { OrderedListToolbar } from "./toolbars/ordered-list";
import { ImagePlaceholderToolbar } from "./toolbars/image-placeholder-toolbar";
import { ColorHighlightToolbar } from "./toolbars/color-and-highlight";
import { SearchAndReplaceToolbar } from "./toolbars/search-and-replace-toolbar";
import { UndoToolbar } from "./toolbars/undo";
import { HorizontalRuleToolbar } from "./toolbars/horizontal-rule";
import { LinkToolbar } from "./toolbars/link";
import { HardBreakToolbar } from "./toolbars/hard-break";
import { AlignmentTooolbar } from "./toolbars/alignment";
import TextAlign from "@tiptap/extension-text-align";

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
      HTMLAttributes: {
        class: "tiptap-heading",
      },
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
];

interface TiptapEditorProps {
  content?: string;
}

const TiptapEditor = ({ content }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }
  return (
    <div className="border relative rounded-md overflow-hidden pb-3">
      <div className="flex w-full items-center py-2 px-2 justify-between border-b  sticky top-0 left-0 bg-background z-20">
        <ToolbarProvider editor={editor}>
          <div className="flex items-center gap-2">
            <UndoToolbar />
            <RedoToolbar />
            <Separator orientation="vertical" className="h-7" />

            <BoldToolbar />
            <ItalicToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <AlignmentTooolbar />
            <HardBreakToolbar />
            <HorizontalRuleToolbar />
            <ImagePlaceholderToolbar />
            <LinkToolbar />
            <ColorHighlightToolbar />
          </div>
          <SearchAndReplaceToolbar />
        </ToolbarProvider>
      </div>
      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="cursor-text min-h-72 bg-background"
      >
        <EditorContent className="outline-none" editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;

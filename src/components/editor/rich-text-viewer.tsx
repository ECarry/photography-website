"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { ImageExtension } from "./extensions/image";
import { YoutubeExtension } from "./extensions/youtube";
import { MapboxExtension } from "./extensions/mapbox";
import { FontSize } from "./extensions/font-size";

interface RichTextProps {
  content: string | Record<string, unknown>;
}

export default function RichTextViewer({ content }: RichTextProps) {
  const editor = useEditor({
    extensions: [
      YoutubeExtension.configure({
        controls: false,
        nocookie: true,
      }),
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
      FontSize,
      Underline,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      MapboxExtension,
      ImageExtension,
    ],
    content: content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}

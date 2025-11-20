"use client";

import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { ImageExtension } from "./extensions/image";
import { ImagePlaceholder } from "./extensions/image-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "./extensions/font-size";
import { Subscript, Superscript } from "lucide-react";
import { RedoToolbar } from "./toolbars/redo";
import { BoldToolbar } from "./toolbars/bold";
import { ItalicToolbar } from "./toolbars/italic";
import { BulletListToolbar } from "./toolbars/bullet-list";
import { OrderedListToolbar } from "./toolbars/ordered-list";
import { ImagePlaceholderToolbar } from "./toolbars/image-placeholder-toolbar";
import { ColorHighlightToolbar } from "./toolbars/color-and-highlight";
import { FontSizeToolbar } from "./toolbars/font-size";
import { UndoToolbar } from "./toolbars/undo";
import { HorizontalRuleToolbar } from "./toolbars/horizontal-rule";
import { HardBreakToolbar } from "./toolbars/hard-break";
import { AlignmentToolbar } from "./toolbars/alignment";
import { BlockquoteToolbar } from "./toolbars/blockquote";
import { CodeBlockToolbar } from "./toolbars/code-block";
import { StrikeThroughToolbar } from "./toolbars/strikethrough";
import { YoutubeToolbar } from "./toolbars/youtube";
import { YoutubeExtension } from "./extensions/youtube";
import TextAlign from "@tiptap/extension-text-align";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { s3Client } from "@/modules/s3/lib/s3";
import { toast } from "sonner";
import { ToolbarProvider } from "./toolbars/toolbar-provider";

interface TiptapEditorProps {
  content?: string;
  onChange?: (value: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const trpc = useTRPC();
  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const extensions = useMemo(
    () =>
      [
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
          codeBlock: {
            HTMLAttributes: {
              class: "bg-muted rounded-md p-4 font-mono text-sm",
            },
          },
          blockquote: {
            HTMLAttributes: {
              class: "border-l-4 border-primary pl-4 italic",
            },
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        TextStyle,
        FontSize,
        Subscript,
        Superscript,
        Underline,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        YoutubeExtension.configure({
          controls: false,
          nocookie: true,
        }),
        ImageExtension,
        ImagePlaceholder.configure({
          allowedMimeTypes: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          },
          maxFiles: 1,
          onDrop: async (files, editor) => {
            const file = files[0];
            if (!file) return;

            try {
              const { publicUrl } = await s3Client.upload({
                file,
                folder: "posts",
                getUploadUrl: async ({ filename, contentType, folder }) => {
                  const data = await createPresignedUrl.mutateAsync({
                    filename,
                    contentType,
                    size: file.size,
                    folder,
                  });

                  return {
                    uploadUrl: data.presignedUrl,
                    publicUrl: data.key,
                  };
                },
              });

              editor.chain().focus().setImage({ src: publicUrl }).run();

              toast.success("Image uploaded successfully");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to upload image"
              );
            }
          },
        }),
      ] as Extension[],
    [createPresignedUrl]
  );

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
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
            <StrikeThroughToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <CodeBlockToolbar />
            <BlockquoteToolbar />
            <AlignmentToolbar />
            <HardBreakToolbar />
            <HorizontalRuleToolbar />
            <YoutubeToolbar />
            <ImagePlaceholderToolbar />
            <FontSizeToolbar />
            <ColorHighlightToolbar />
          </div>
        </ToolbarProvider>
      </div>

      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="cursor-text min-h-72 bg-background"
      >
        <EditorContent className="outline-none" editor={editor} />
        {editor && (
          <BubbleMenu editor={editor}>
            <ToolbarProvider editor={editor}>
              <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
                <BoldToolbar />
                <ItalicToolbar />
                <StrikeThroughToolbar />
                <FontSizeToolbar />
                <ColorHighlightToolbar />
              </div>
            </ToolbarProvider>
          </BubbleMenu>
        )}

        {editor && (
          <FloatingMenu editor={editor}>
            <ToolbarProvider editor={editor}>
              <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
                <ImagePlaceholderToolbar />
                <YoutubeToolbar />
                <CodeBlockToolbar />
                <BlockquoteToolbar />
              </div>
            </ToolbarProvider>
          </FloatingMenu>
        )}
      </div>
    </div>
  );
};

export default TiptapEditor;

"use client";

import "./editor.css";
import { useEffect, useMemo, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { ImageExtension } from "./extensions/image";
import { ImagePlaceholder } from "./extensions/image-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "./extensions/font-size";
import { ALLOWED_IMAGE_EXTENSIONS } from "@/constants";
import { RedoToolbar } from "./toolbars/redo";
import { BoldToolbar } from "./toolbars/bold";
import { ItalicToolbar } from "./toolbars/italic";
import { BulletListToolbar } from "./toolbars/bullet-list";
import { OrderedListToolbar } from "./toolbars/ordered-list";
import { ImagePlaceholderToolbar } from "./toolbars/image-placeholder-toolbar";
import { ColorToolbar } from "./toolbars/color";
import { HighlightToolbar } from "./toolbars/highlight";
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
import { MapboxToolbar } from "./toolbars/mapbox";
import { MapboxExtension } from "./extensions/mapbox";
import TextAlign from "@tiptap/extension-text-align";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { s3Client } from "@/modules/s3/lib/upload-client";
import { toast } from "sonner";
import { ToolbarProvider } from "./toolbars/toolbar-provider";
import { HeadingToolbar } from "./toolbars/heading";

interface TiptapEditorProps {
  content?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  onUploadStateChange?: (uploading: boolean) => void;
}

const TiptapEditor = ({ content, onChange, disabled = false, onUploadStateChange }: TiptapEditorProps) => {
  const uploadInFlight = useRef(false);
  const trpc = useTRPC();
  const { mutateAsync: createPresignedUrl } = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const extensions = useMemo(
    () =>
      [
        StarterKit.configure({
          underline: false,
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
            levels: [1, 2, 3],
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
        Underline,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        YoutubeExtension.configure({
          controls: false,
          nocookie: true,
        }),
        MapboxExtension,
        ImageExtension,
        ImagePlaceholder.configure({
          allowedMimeTypes: {
            "image/*": [...ALLOWED_IMAGE_EXTENSIONS],
          },
          maxFiles: 1,
          onDrop: async (files, editor, getPos) => {
            const file = files[0];
            if (!file || !editor.isEditable || uploadInFlight.current) return;
            uploadInFlight.current = true;
            onUploadStateChange?.(true);

            try {
              const { publicUrl } = await s3Client.upload({
                file,
                folder: "posts",
                getUploadUrl: async ({ filename, contentType, folder }) => {
                  const data = await createPresignedUrl({
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

              if (editor.isDestroyed) return;
              const position = getPos();
              const placeholder = position === undefined ? null : editor.state.doc.nodeAt(position);
              if (position === undefined || placeholder?.type.name !== "image-placeholder") return;
              editor.chain().focus().insertContentAt(
                { from: position, to: position + placeholder.nodeSize },
                { type: "image", attrs: { src: publicUrl } },
              ).run();

              toast.success("Image uploaded successfully");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to upload image"
              );
            } finally {
              uploadInFlight.current = false;
              onUploadStateChange?.(false);
            }
          },
        }),
      ],
    [createPresignedUrl, onUploadStateChange]
  );

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: { "aria-label": "Story content", role: "textbox", "aria-multiline": "true" },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  const characterCount = useEditorState({
    editor,
    selector: ({ editor }) => editor?.getText().length ?? 0,
  });

  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  if (!editor) {
    return <div className="min-h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  return (
    <div className="story-editor relative min-w-0 rounded-xl border bg-background shadow-sm">
      <div className="sticky top-0 z-10 flex w-full items-center rounded-t-xl border-b bg-background/95 p-2 backdrop-blur">
        <ToolbarProvider editor={editor}>
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <UndoToolbar />
            <RedoToolbar />
            <Separator orientation="vertical" className="h-7" />
            <BoldToolbar />
            <ItalicToolbar />
            <StrikeThroughToolbar />
            <HeadingToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <CodeBlockToolbar />
            <BlockquoteToolbar />
            <AlignmentToolbar />
            <HardBreakToolbar />
            <HorizontalRuleToolbar />
            <YoutubeToolbar />
            <MapboxToolbar />
            <ImagePlaceholderToolbar />
            <FontSizeToolbar />
            <ColorToolbar />
            <HighlightToolbar />
          </div>
        </ToolbarProvider>
      </div>

      <div
        onClick={() => {
          editor.chain().focus().run();
        }}
        className="relative min-h-96 cursor-text px-1 py-6 sm:px-4 sm:py-8"
      >
        <BubbleMenu editor={editor} className="z-50">
          <ToolbarProvider editor={editor}>
            <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
              <BoldToolbar />
              <ItalicToolbar />
              <StrikeThroughToolbar />
              <FontSizeToolbar />
              <ColorToolbar />
              <HighlightToolbar />
            </div>
          </ToolbarProvider>
        </BubbleMenu>

        <FloatingMenu editor={editor} className="z-50">
          <ToolbarProvider editor={editor}>
            <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
              <ImagePlaceholderToolbar />
              <YoutubeToolbar />
              <CodeBlockToolbar />
              <BlockquoteToolbar />
            </div>
          </ToolbarProvider>
        </FloatingMenu>

        <EditorContent className="outline-none" editor={editor} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 rounded-b-xl border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <span>Tell the story behind the frame.</span>
        <span className="tabular-nums">{characterCount ?? 0} characters</span>
      </div>
    </div>
  );
};

export default TiptapEditor;

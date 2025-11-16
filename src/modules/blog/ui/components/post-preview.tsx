import RichTextViewer from "@/components/editor/rich-text-viewer";

export const PostPreview = ({ content }: { content: string | null }) => {
  return <RichTextViewer content={content || ""} />;
};

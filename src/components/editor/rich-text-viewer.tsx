import "./editor.css";
import { cn } from "@/lib/utils";

interface RichTextProps {
  content: string;
  className?: string;
}

export default function RichTextViewer({ content, className }: RichTextProps) {
  return (
    <div
      className={cn("prose-content", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

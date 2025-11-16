"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { IconX } from "@tabler/icons-react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export const TagsInput = ({ value, onChange }: TagsInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(inputValue);
      setInputValue("");
    }

    if (event.key === "Backspace" && inputValue === "" && value.length > 0) {
      event.preventDefault();
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 pl-2 pr-1"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="inline-flex rounded-full p-0.5 hover:bg-muted/80"
          >
            <IconX className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        placeholder={
          value.length === 0 ? "Add tags and press Enter" : "Add more tags"
        }
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

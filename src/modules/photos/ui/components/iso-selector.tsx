"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Standard ISO values in photography
const STANDARD_ISO_VALUES = [
  50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250,
  1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000,
  25600, 32000, 40000, 51200, 64000, 80000, 102400,
];

interface ISOSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

export function ISOSelector({ value, onChange }: ISOSelectorProps) {
  const [isCustom, setIsCustom] = useState(
    value !== undefined && !STANDARD_ISO_VALUES.includes(value)
  );

  const handleSelectChange = (val: string) => {
    if (val === "custom") {
      setIsCustom(true);
      onChange(undefined);
    } else {
      setIsCustom(false);
      onChange(parseInt(val));
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value) : undefined;
    onChange(val);
  };

  return (
    <div className="space-y-2">
      <Select
        value={isCustom ? "custom" : value?.toString()}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select ISO">
            {isCustom ? "Custom" : value ? `ISO ${value}` : "Select ISO"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {STANDARD_ISO_VALUES.map((iso) => (
            <SelectItem key={iso} value={iso.toString()}>
              ISO {iso}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom value...</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">ISO</span>
          <Input
            type="number"
            placeholder="Enter custom value"
            value={value ?? ""}
            onChange={handleCustomChange}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCustom(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

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

// Standard aperture values in photography
const STANDARD_APERTURES = [
  1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0,
  5.6, 6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32,
];

interface ApertureSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

export function ApertureSelector({ value, onChange }: ApertureSelectorProps) {
  const [isCustom, setIsCustom] = useState(
    value !== undefined && !STANDARD_APERTURES.includes(value)
  );

  const handleSelectChange = (val: string) => {
    if (val === "custom") {
      setIsCustom(true);
      onChange(undefined);
    } else {
      setIsCustom(false);
      onChange(parseFloat(val));
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseFloat(e.target.value) : undefined;
    onChange(val);
  };

  return (
    <div className="space-y-2">
      <Select
        value={isCustom ? "custom" : value?.toString()}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select aperture">
            {isCustom ? "Custom" : value ? `f/${value}` : "Select aperture"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {STANDARD_APERTURES.map((f) => (
            <SelectItem key={f} value={f.toString()}>
              f/{f}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom value...</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">f/</span>
          <Input
            type="number"
            step="0.1"
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

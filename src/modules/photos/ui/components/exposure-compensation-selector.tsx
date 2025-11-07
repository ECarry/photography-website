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

// Standard exposure compensation values in EV (1/3 stop increments)
// Range: -5 EV to +5 EV
const STANDARD_EV_VALUES = [
  -5.0, -4.67, -4.33, -4.0, -3.67, -3.33, -3.0, -2.67, -2.33, -2.0, -1.67,
  -1.33, -1.0, -0.67, -0.33, 0.0, 0.33, 0.67, 1.0, 1.33, 1.67, 2.0, 2.33, 2.67,
  3.0, 3.33, 3.67, 4.0, 4.33, 4.67, 5.0,
];

interface ExposureCompensationSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

function formatEV(value: number): string {
  if (value === 0) return "0 EV";
  const sign = value > 0 ? "+" : "";
  
  // Check if it's a whole number
  if (value % 1 === 0) {
    return `${sign}${value} EV`;
  }
  
  // Format with up to 2 decimal places, removing trailing zeros
  return `${sign}${value.toFixed(2).replace(/\.?0+$/, "")} EV`;
}

function findClosestEV(value: number): number | null {
  let closest = STANDARD_EV_VALUES[0];
  let minDiff = Math.abs(value - closest);

  for (const ev of STANDARD_EV_VALUES) {
    const diff = Math.abs(value - ev);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ev;
    }
  }

  // Consider it custom if the difference is more than 0.01 EV
  return minDiff < 0.01 ? closest : null;
}

export function ExposureCompensationSelector({
  value,
  onChange,
}: ExposureCompensationSelectorProps) {
  const closestEV = value !== undefined ? findClosestEV(value) : null;
  const [isCustom, setIsCustom] = useState(
    value !== undefined && closestEV === null
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

  const displayValue = isCustom
    ? "Custom"
    : value !== undefined
    ? formatEV(closestEV ?? value)
    : "Select EV";

  return (
    <div className="space-y-2">
      <Select
        value={
          isCustom ? "custom" : closestEV?.toString() || value?.toString()
        }
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select exposure compensation">
            {displayValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {STANDARD_EV_VALUES.map((ev) => (
            <SelectItem key={ev} value={ev.toString()}>
              {formatEV(ev)}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom value...</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            step="0.33"
            placeholder="Enter EV value (e.g., -1.5)"
            value={value ?? ""}
            onChange={handleCustomChange}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            EV
          </span>
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

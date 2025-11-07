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

// Standard shutter speeds in photography (value in seconds, label for display)
const STANDARD_SHUTTER_SPEEDS = [
  { value: 1 / 8000, label: "1/8000" },
  { value: 1 / 6400, label: "1/6400" },
  { value: 1 / 5000, label: "1/5000" },
  { value: 1 / 4000, label: "1/4000" },
  { value: 1 / 3200, label: "1/3200" },
  { value: 1 / 2500, label: "1/2500" },
  { value: 1 / 2000, label: "1/2000" },
  { value: 1 / 1600, label: "1/1600" },
  { value: 1 / 1250, label: "1/1250" },
  { value: 1 / 1000, label: "1/1000" },
  { value: 1 / 800, label: "1/800" },
  { value: 1 / 640, label: "1/640" },
  { value: 1 / 500, label: "1/500" },
  { value: 1 / 400, label: "1/400" },
  { value: 1 / 320, label: "1/320" },
  { value: 1 / 250, label: "1/250" },
  { value: 1 / 200, label: "1/200" },
  { value: 1 / 160, label: "1/160" },
  { value: 1 / 125, label: "1/125" },
  { value: 1 / 100, label: "1/100" },
  { value: 1 / 80, label: "1/80" },
  { value: 1 / 60, label: "1/60" },
  { value: 1 / 50, label: "1/50" },
  { value: 1 / 40, label: "1/40" },
  { value: 1 / 30, label: "1/30" },
  { value: 1 / 25, label: "1/25" },
  { value: 1 / 20, label: "1/20" },
  { value: 1 / 15, label: "1/15" },
  { value: 1 / 13, label: "1/13" },
  { value: 1 / 10, label: "1/10" },
  { value: 1 / 8, label: "1/8" },
  { value: 1 / 6, label: "1/6" },
  { value: 1 / 5, label: "1/5" },
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 3, label: "1/3" },
  { value: 0.4, label: "0.4s" },
  { value: 0.5, label: "0.5s" },
  { value: 0.6, label: "0.6s" },
  { value: 0.8, label: "0.8s" },
  { value: 1, label: "1s" },
  { value: 1.3, label: "1.3s" },
  { value: 1.6, label: "1.6s" },
  { value: 2, label: "2s" },
  { value: 2.5, label: "2.5s" },
  { value: 3, label: "3s" },
  { value: 4, label: "4s" },
  { value: 5, label: "5s" },
  { value: 6, label: "6s" },
  { value: 8, label: "8s" },
  { value: 10, label: "10s" },
  { value: 13, label: "13s" },
  { value: 15, label: "15s" },
  { value: 20, label: "20s" },
  { value: 25, label: "25s" },
  { value: 30, label: "30s" },
];

interface ShutterSpeedSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

function formatShutterSpeed(seconds: number): string {
  if (seconds >= 1) {
    return `${seconds}s`;
  } else {
    const denominator = Math.round(1 / seconds);
    return `1/${denominator}`;
  }
}

function findClosestShutterSpeed(value: number): typeof STANDARD_SHUTTER_SPEEDS[0] | null {
  let closest = STANDARD_SHUTTER_SPEEDS[0];
  let minDiff = Math.abs(value - closest.value);

  for (const speed of STANDARD_SHUTTER_SPEEDS) {
    const diff = Math.abs(value - speed.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = speed;
    }
  }

  // Consider it custom if the difference is more than 0.0001 seconds
  return minDiff < 0.0001 ? closest : null;
}

export function ShutterSpeedSelector({
  value,
  onChange,
}: ShutterSpeedSelectorProps) {
  const closestSpeed = value ? findClosestShutterSpeed(value) : null;
  const [isCustom, setIsCustom] = useState(
    value !== undefined && closestSpeed === null
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
    : value
    ? closestSpeed?.label || formatShutterSpeed(value)
    : "Select shutter speed";

  return (
    <div className="space-y-2">
      <Select
        value={isCustom ? "custom" : closestSpeed?.value.toString() || value?.toString()}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select shutter speed">
            {displayValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {STANDARD_SHUTTER_SPEEDS.map((speed) => (
            <SelectItem key={speed.value} value={speed.value.toString()}>
              {speed.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom value...</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            step="0.0001"
            placeholder="Enter seconds (e.g., 0.0125)"
            value={value ?? ""}
            onChange={handleCustomChange}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            seconds
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

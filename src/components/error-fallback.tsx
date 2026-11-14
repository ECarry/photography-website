"use client";

import { TriangleAlert } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10 text-center"
    >
      <TriangleAlert
        aria-hidden="true"
        className="size-6 text-muted-foreground"
      />
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">Please try again.</p>
      </div>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

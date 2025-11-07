"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";

interface TextScrollProps {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
}

const TextScroll = ({
  children,
  className,
  pauseOnHover = false,
}: TextScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const updateShouldAnimate = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const contentWidth = content.scrollWidth;
      const containerWidth = container.clientWidth;
      setShouldAnimate(contentWidth > containerWidth);
    };

    updateShouldAnimate();
    window.addEventListener("resize", updateShouldAnimate);

    return () => {
      window.removeEventListener("resize", updateShouldAnimate);
    };
  }, [children]);

  if (!shouldAnimate) {
    return (
      <div ref={containerRef} className={className}>
        <div ref={contentRef}>{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group flex gap-4 overflow-hidden [--gap:1rem]",
        pauseOnHover && "[&:hover>*]:pause",
        className
      )}
    >
      <div
        ref={contentRef}
        className="flex min-w-full shrink-0 justify-end gap-4 animate-marquee"
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex min-w-full shrink-0 justify-end gap-4 animate-marquee"
      >
        {children}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-muted"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-muted"></div>
    </div>
  );
};

export default TextScroll;

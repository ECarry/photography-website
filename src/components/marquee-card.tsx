import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MarqueeCardProps {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
}

/**
 * MarqueeCard component displays a marquee card.
 *
 * @returns {JSX.Element} - The MarqueeCard component.
 */
export function MarqueeCard({
  children,
  className,
  pauseOnHover = false,
}: MarqueeCardProps) {
  return (
    <div
      className={cn(
        "group flex gap-16 overflow-hidden [--gap:4rem]",
        pauseOnHover && "[&:hover>*]:pause",
        className
      )}
    >
      {/* Duplicate the children to create the infinite scroll effect */}
      <div className="flex min-w-full shrink-0 items-center justify-around gap-16 animate-marquee">
        {children}
      </div>
      <div
        aria-hidden
        className="flex min-w-full shrink-0 items-center justify-around gap-16 animate-marquee"
      >
        {children}
      </div>
    </div>
  );
}

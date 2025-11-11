import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /**
   * Icon or visual element to display
   */
  icon?: ReactNode;
  /**
   * Main title/heading
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Action button or elements
   */
  action?: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Container height
   */
  height?: string;
}

/**
 * EmptyState Component
 * A reusable component for displaying empty states with icon, title, description, and optional action
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  height = "h-full",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        height,
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

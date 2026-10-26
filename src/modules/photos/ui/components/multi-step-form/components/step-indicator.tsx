import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: Array<{ id: string; title: string; description: string }>;
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol
      aria-label="Photo upload steps"
      className="mb-4 grid grid-cols-4 gap-1 rounded-xl border bg-muted/20 p-2 sm:mb-6 sm:gap-2 sm:p-3"
    >
      {steps.map((step, index) => (
        <li
          key={step.id}
          aria-current={index === currentStep ? "step" : undefined}
          className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:gap-2"
        >
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors sm:size-8 sm:text-xs",
              index <= currentStep ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground",
              index === currentStep && "ring-4 ring-primary/10",
            )}
          >
            {index < currentStep ? <CheckCircle2 className="size-4" aria-label="Completed" /> : index + 1}
          </span>
          <span
            className={cn(
              "max-w-full truncate text-[10px] leading-tight sm:text-xs",
              index === currentStep
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {step.title}
          </span>
        </li>
      ))}
    </ol>
  );
}

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: Array<{ id: string; title: string; description: string }>;
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol aria-label="Photo upload steps" className="mb-6 grid grid-cols-4 gap-2 rounded-xl border bg-muted/20 p-3">
      {steps.map((step, index) => (
        <li key={step.id} aria-current={index === currentStep ? "step" : undefined} className="flex flex-col items-center gap-2 text-center">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              index <= currentStep ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground",
              index === currentStep && "ring-4 ring-primary/10",
            )}
          >
            {index < currentStep ? <CheckCircle2 className="size-4" aria-label="Completed" /> : index + 1}
          </span>
          <span className={cn("text-xs", index === currentStep ? "font-semibold" : "text-muted-foreground")}>{step.title}</span>
        </li>
      ))}
    </ol>
  );
}

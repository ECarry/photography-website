import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: Array<{ id: string; title: string; description: string }>;
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex justify-between">
      {steps.map((s, i) => (
        <div key={s.id} className="flex flex-col items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
              i < currentStep
                ? "bg-primary text-primary-foreground"
                : i === currentStep
                ? "bg-primary text-primary-foreground ring-primary/30 ring-2"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span className="mt-1 hidden text-xs sm:block">{s.title}</span>
        </div>
      ))}
    </div>
  );
}

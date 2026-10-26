import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-5 sm:mb-8">
      <div className="mb-2 flex justify-between">
        <span className="text-xs font-medium sm:text-sm">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs font-medium sm:text-sm">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

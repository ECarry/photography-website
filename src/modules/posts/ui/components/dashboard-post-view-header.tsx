import { Button } from "@/components/ui/button";

interface DashboardPostViewHeaderProps {
  title: string;
  onRemove: () => void;
  onSave: () => void;
}

export const DashboardPostViewHeader = ({
  title,
  onRemove,
  onSave,
}: DashboardPostViewHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl">{title}</h1>
      <div className="flex gap-2">
        <Button onClick={onRemove} variant="destructive">
          Delete
        </Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
};

"use client";

import { Progress } from "@/components/ui/progress";
import { calculateProgress } from "@/lib/utils";

interface TaskProgressBarProps {
  total: number;
  completed: number;
  showLabel?: boolean;
}

export function TaskProgressBar({
  total,
  completed,
  showLabel = true,
}: TaskProgressBarProps) {
  const progress = calculateProgress(total, completed);
  if (total === 0) return null;
  return (
    <div className="space-y-1">
      <Progress value={progress} className="h-1.5" />
      {showLabel && (
        <p className="text-xs text-muted-foreground">
          {completed}/{total} subtasks · {progress}%
        </p>
      )}
    </div>
  );
}

"use client";

import { Progress } from "@/components/ui/progress";
import { calculateProgress } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaskProgressBarProps {
  total: number;
  completed: number;
  showLabel?: boolean;
  className?: string;
}

export function TaskProgressBar({
  total,
  completed,
  showLabel = true,
  className,
}: TaskProgressBarProps) {
  const progress = calculateProgress(total, completed);
  if (total === 0) return null;

  const isComplete = completed === total;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Progress
        value={progress}
        className={cn(
          "h-2 [&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-500 [&_[data-slot=progress-indicator]]:ease-out",
          isComplete && "[&_[data-slot=progress-indicator]]:bg-green-500"
        )}
      />
      {showLabel && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            {completed}/{total} subtasks
          </p>
          <p
            className={cn(
              "text-xs font-medium tabular-nums",
              isComplete
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            )}
          >
            {progress}%
          </p>
        </div>
      )}
    </div>
  );
}

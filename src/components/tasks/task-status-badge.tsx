"use client";

import { Badge } from "@/components/ui/badge";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type TaskStatusValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: string;
  isOverdue?: boolean;
}

export function TaskStatusBadge({ status, isOverdue }: TaskStatusBadgeProps) {
  if (isOverdue) {
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">
        Overdue
      </Badge>
    );
  }
  const label = TASK_STATUS_LABELS[status as TaskStatusValue] ?? status;
  const color = TASK_STATUS_COLORS[status as TaskStatusValue] ?? "";
  return (
    <Badge className={cn(color, "border-0")}>{label}</Badge>
  );
}

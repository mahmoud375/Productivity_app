"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskProgressBar } from "./task-progress-bar";
import { formatDateRange, isOverdue } from "@/lib/utils";
import type { TaskWithSubtasks, Subtask } from "@/types/task";

interface TaskCardProps {
  task: TaskWithSubtasks;
}

export function TaskCard({ task }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter(
    (s: Subtask) => s.isCompleted
  ).length;
  const totalSubtasks = task.subtasks.length;
  const overdue = isOverdue(task.endDate, task.status);

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group border-border animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {task.title}
            </h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          </div>
          <TaskStatusBadge status={task.status} isOverdue={overdue} />
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          {(task.startDate || task.endDate) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>
                {formatDateRange(task.startDate, task.endDate)}
              </span>
            </div>
          )}
          {totalSubtasks > 0 && (
            <TaskProgressBar
              total={totalSubtasks}
              completed={completedSubtasks}
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

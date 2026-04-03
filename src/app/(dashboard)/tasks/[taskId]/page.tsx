"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { TaskProgressBar } from "@/components/tasks/task-progress-bar";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { useTask } from "@/hooks/use-tasks";
import { formatDateRange, isOverdue } from "@/lib/utils";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  const { data: task, isLoading, isError } = useTask(taskId);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );

  if (isError || !task)
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Task not found.</p>
        <Button variant="link" onClick={() => router.push("/tasks")}>
          Back to Tasks
        </Button>
      </div>
    );

  const completedSubtasks = task.subtasks.filter(
    (s) => s.isCompleted
  ).length;
  const overdue = isOverdue(task.endDate, task.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/tasks")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tasks
        </Button>
      </div>

      {isEditing ? (
        <>
          <TaskForm task={task} mode="edit" />
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel Edit
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <TaskStatusBadge
                status={task.status}
                isOverdue={overdue}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <TaskDeleteDialog
                taskId={task.id}
                taskTitle={task.title}
              />
            </div>
          </div>

          {task.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {task.description}
            </p>
          )}

          {(task.startDate || task.endDate) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {formatDateRange(task.startDate, task.endDate)}
            </div>
          )}

          {task.subtasks.length > 0 && (
            <TaskProgressBar
              total={task.subtasks.length}
              completed={completedSubtasks}
            />
          )}
        </div>
      )}
    </div>
  );
}

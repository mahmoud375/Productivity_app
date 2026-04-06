"use client";

import { ListChecks } from "lucide-react";
import { SubtaskItem } from "./subtask-item";
import { SubtaskAddInput } from "./subtask-add-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
} from "@/hooks/use-subtasks";

interface SubtaskListProps {
  taskId: string;
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const { data: subtasks, isLoading } = useSubtasks(taskId);
  const createSubtask = useCreateSubtask(taskId);
  const updateSubtask = useUpdateSubtask(taskId);
  const deleteSubtask = useDeleteSubtask(taskId);

  function handleAdd(title: string) {
    createSubtask.mutate({ title });
  }

  function handleToggle(subtaskId: string, isCompleted: boolean) {
    updateSubtask.mutate({ subtaskId, data: { isCompleted } });
  }

  function handleUpdate(subtaskId: string, title: string) {
    updateSubtask.mutate({ subtaskId, data: { title } });
  }

  function handleDelete(subtaskId: string) {
    deleteSubtask.mutate(subtaskId);
  }

  const isMutating =
    createSubtask.isPending ||
    updateSubtask.isPending ||
    deleteSubtask.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">Subtasks</span>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-11 rounded-lg" />
        ))}
      </div>
    );
  }

  const completed = subtasks?.filter((s) => s.isCompleted).length ?? 0;
  const total = subtasks?.length ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">Subtasks</span>
        </div>
        {total > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {completed}/{total} completed
          </span>
        )}
      </div>

      {subtasks && subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              disabled={isMutating}
            />
          ))}
        </div>
      )}

      <SubtaskAddInput
        onAdd={handleAdd}
        isPending={createSubtask.isPending}
      />
    </div>
  );
}

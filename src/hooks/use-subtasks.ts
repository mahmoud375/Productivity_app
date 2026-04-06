"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import type { Subtask, TaskWithSubtasks } from "@/types/task";
import type {
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from "@/lib/validators/subtask.schema";

// Response shape from the tasks list API
interface TasksListResponse {
  tasks: TaskWithSubtasks[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Derive the parent task status from subtask completion ratio.
 * Matches the server-side `autoUpdateTaskStatus` logic exactly.
 */
function deriveTaskStatus(
  subtasks: Subtask[]
): "todo" | "in_progress" | "completed" {
  if (subtasks.length === 0) return "todo";
  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  if (completedCount === subtasks.length) return "completed";
  if (completedCount > 0) return "in_progress";
  return "todo";
}

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.subtasks(taskId),
    queryFn: () => api.get<Subtask[]>(`/api/tasks/${taskId}/subtasks`),
    enabled: !!taskId,
  });
}

export function useCreateSubtask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubtaskInput) =>
      api.post<Subtask>(`/api/tasks/${taskId}/subtasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subtasks(taskId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      toast.success("Subtask added");
    },
    onError: () => {
      toast.error("Failed to add subtask");
    },
  });
}

export function useUpdateSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subtaskId,
      data,
    }: {
      subtaskId: string;
      data: UpdateSubtaskInput;
    }) =>
      api.patch<Subtask>(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`,
        data
      ),

    onMutate: async ({ subtaskId, data }) => {
      // ── 1. Cancel all in-flight queries we're about to touch ──
      await Promise.all([
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.subtasks(taskId) }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.task(taskId) }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.tasks }),
      ]);

      // ── 2. Snapshot all three caches for rollback ──
      const previousSubtasks = queryClient.getQueryData<Subtask[]>(
        QUERY_KEYS.subtasks(taskId)
      );
      const previousTask = queryClient.getQueryData<TaskWithSubtasks>(
        QUERY_KEYS.task(taskId)
      );
      const previousTasksList = queryClient.getQueryData<TasksListResponse>(
        [...QUERY_KEYS.tasks]
      );

      // ── 3. Optimistically update the subtasks cache ──
      let updatedSubtasks: Subtask[] | undefined;

      if (previousSubtasks) {
        updatedSubtasks = previousSubtasks.map((s) =>
          s.id === subtaskId ? { ...s, ...data } : s
        );
        queryClient.setQueryData<Subtask[]>(
          QUERY_KEYS.subtasks(taskId),
          updatedSubtasks
        );
      }

      // ── 4. Derive new parent task status from updated subtasks ──
      // Use the subtasks we just patched, or fall back to the task's embedded subtasks
      const subtasksForStatus =
        updatedSubtasks ??
        previousTask?.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, ...data } : s
        );

      const newStatus = subtasksForStatus
        ? deriveTaskStatus(subtasksForStatus)
        : undefined;

      // ── 5. Optimistically update the individual task cache ──
      if (previousTask) {
        const patchedSubtasks = previousTask.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, ...data } : s
        );
        queryClient.setQueryData<TaskWithSubtasks>(
          QUERY_KEYS.task(taskId),
          {
            ...previousTask,
            subtasks: patchedSubtasks,
            ...(newStatus !== undefined ? { status: newStatus } : {}),
          }
        );
      }

      // ── 6. Optimistically update the tasks list cache ──
      // The tasks list may contain multiple pages of cached data.
      // We need to find and patch the correct task in the list.
      queryClient.setQueriesData<TasksListResponse>(
        { queryKey: QUERY_KEYS.tasks },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const patchedSubtasks = t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, ...data } : s
              );
              const derivedStatus = deriveTaskStatus(patchedSubtasks);
              return {
                ...t,
                subtasks: patchedSubtasks,
                status: derivedStatus,
              };
            }),
          };
        }
      );

      return { previousSubtasks, previousTask, previousTasksList };
    },

    onError: (_err, _vars, context) => {
      // ── Strict rollback of ALL three caches ──
      if (context?.previousSubtasks) {
        queryClient.setQueryData(
          QUERY_KEYS.subtasks(taskId),
          context.previousSubtasks
        );
      }
      if (context?.previousTask) {
        queryClient.setQueryData(
          QUERY_KEYS.task(taskId),
          context.previousTask
        );
      }
      if (context?.previousTasksList) {
        queryClient.setQueryData(
          [...QUERY_KEYS.tasks],
          context.previousTasksList
        );
      }
      toast.error("Failed to update subtask");
    },

    onSettled: () => {
      // ── Revalidate all caches with server truth ──
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subtasks(taskId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useDeleteSubtask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subtaskId: string) =>
      api.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subtasks(taskId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      toast.success("Subtask deleted");
    },
    onError: () => {
      toast.error("Failed to delete subtask");
    },
  });
}

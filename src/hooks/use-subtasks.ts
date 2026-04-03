"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import type { Subtask } from "@/types/task";
import type {
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from "@/lib/validators/subtask.schema";

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
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.subtasks(taskId),
      });
      const previous = queryClient.getQueryData<Subtask[]>(
        QUERY_KEYS.subtasks(taskId)
      );
      queryClient.setQueryData<Subtask[]>(
        QUERY_KEYS.subtasks(taskId),
        (old) =>
          old?.map((s) =>
            s.id === subtaskId ? { ...s, ...data } : s
          ) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          QUERY_KEYS.subtasks(taskId),
          context.previous
        );
      }
    },
    onSettled: () => {
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
    },
  });
}

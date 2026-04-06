"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import type { Task, TaskWithSubtasks } from "@/types/task";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput,
} from "@/lib/validators/task.schema";

interface TasksResponse {
  tasks: TaskWithSubtasks[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useTasks(filters?: Partial<TaskQueryInput>) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.sort) params.set("sort", filters.sort);
  if (filters?.order) params.set("order", filters.order);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.filterStartDate) params.set("filterStartDate", filters.filterStartDate);
  if (filters?.filterEndDate) params.set("filterEndDate", filters.filterEndDate);

  return useQuery({
    queryKey: [...QUERY_KEYS.tasks, filters],
    queryFn: () => api.get<TasksResponse>(`/api/tasks?${params.toString()}`),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.task(taskId),
    queryFn: () => api.get<TaskWithSubtasks>(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      api.post<Task>("/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskInput) =>
      api.patch<Task>(`/api/tasks/${taskId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.delete(`/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

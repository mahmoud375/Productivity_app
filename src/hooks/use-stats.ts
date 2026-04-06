"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";

export interface CompletionTrend {
  date: string;
  count: number;
}

export interface RecentTask {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export interface StatsResponse {
  totalTasks: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionTrends: CompletionTrend[];
  recentActivity: RecentTask[];
}

export function useStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: () => api.get<StatsResponse>("/api/stats"),
  });
}

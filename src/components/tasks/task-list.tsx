"use client";

import { useState, useCallback } from "react";
import { CheckSquare } from "lucide-react";
import { TaskCard } from "./task-card";
import { TaskFilters } from "./task-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskQueryInput } from "@/lib/validators/task.schema";

export function TaskList() {
  const [filters, setFilters] = useState<Partial<TaskQueryInput>>({});
  const handleFiltersChange = useCallback(
    (f: Partial<TaskQueryInput>) => {
      setFilters(f);
    },
    []
  );

  const { data, isLoading, isError } = useTasks(filters);

  return (
    <div className="space-y-6">
      <TaskFilters onFiltersChange={handleFiltersChange} />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-destructive text-sm">
          Failed to load tasks. Please try again.
        </div>
      )}

      {!isLoading && !isError && data?.tasks.length === 0 && (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create your first task to get started with TaskFlow."
          actionLabel="Create Task"
          actionHref="/tasks/new"
        />
      )}

      {!isLoading && !isError && data && data.tasks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  );
}

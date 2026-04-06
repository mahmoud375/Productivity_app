"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { TaskCard } from "./task-card";
import { TaskFilters } from "./task-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskQueryInput } from "@/lib/validators/task.schema";

export function TaskList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read page from URL, default to 1
  const currentPage = Number(searchParams.get("page") ?? "1");

  // Build filters from URL search params
  const filters: Partial<TaskQueryInput> = {
    page: currentPage,
    status: (searchParams.get("status") as TaskQueryInput["status"]) ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: (searchParams.get("sort") as TaskQueryInput["sort"]) ?? undefined,
    order: (searchParams.get("order") as TaskQueryInput["order"]) ?? undefined,
  };

  const { data, isLoading, isError } = useTasks(filters);

  // Helper to update URL search params
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // When filters change: apply them and reset to page 1
  const handleFiltersChange = useCallback(
    (f: Partial<TaskQueryInput>) => {
      const updates: Record<string, string | undefined> = { page: undefined };
      if (f.status) updates.status = f.status;
      else updates.status = undefined;
      if (f.search) updates.search = f.search;
      else updates.search = undefined;
      if (f.sort) updates.sort = f.sort;
      else updates.sort = undefined;
      if (f.order) updates.order = f.order;
      else updates.order = undefined;
      updateSearchParams(updates);
    },
    [updateSearchParams]
  );

  const goToPage = useCallback(
    (page: number) => {
      updateSearchParams({ page: page <= 1 ? undefined : String(page) });
    },
    [updateSearchParams]
  );

  const totalPages = data?.totalPages ?? 1;

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

      {/* Pagination controls */}
      {!isLoading && !isError && data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

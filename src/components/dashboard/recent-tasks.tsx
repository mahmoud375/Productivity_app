"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { isOverdue } from "@/lib/utils";
import type { RecentTask } from "@/hooks/use-stats";

interface RecentTasksProps {
  tasks: RecentTask[] | undefined;
  isLoading: boolean;
}

export function RecentTasks({ tasks, isLoading }: RecentTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <p className="text-xs text-muted-foreground">
          Last 5 updated tasks
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(task.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <TaskStatusBadge
                  status={task.status as "todo" | "in_progress" | "completed"}
                  isOverdue={isOverdue(null, task.status)}
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

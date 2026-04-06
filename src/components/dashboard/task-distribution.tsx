"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatsResponse } from "@/hooks/use-stats";

interface TaskDistributionProps {
  stats: StatsResponse | undefined;
  isLoading: boolean;
}

const SEGMENTS = [
  { key: "completed", label: "Completed", color: "#22c55e" },
  { key: "inProgress", label: "In Progress", color: "#f59e0b" },
  { key: "overdue", label: "Overdue", color: "#ef4444" },
] as const;

export function TaskDistribution({
  stats,
  isLoading,
}: TaskDistributionProps) {
  const data: { name: string; value: number; color: string }[] =
    SEGMENTS.map((s) => ({
      name: s.label,
      value: stats?.[s.key] ?? 0,
      color: s.color,
    }));

  // Calculate remaining tasks (todo, not overdue)
  const accounted = data.reduce((sum, d) => sum + d.value, 0);
  const todo = Math.max((stats?.totalTasks ?? 0) - accounted, 0);
  if (todo > 0) {
    data.push({ name: "To Do", value: todo, color: "#94a3b8" });
  }

  const total = stats?.totalTasks ?? 0;
  const hasData = total > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Task Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">
          Breakdown of task statuses
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : !hasData ? (
          <div className="flex items-center justify-center h-[220px]">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">
                      {d.name}: {d.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

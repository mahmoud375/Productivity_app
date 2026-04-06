"use client";

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatsResponse } from "@/hooks/use-stats";

interface StatsCardsProps {
  stats: StatsResponse | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: "totalTasks" as const,
    label: "Total Tasks",
    icon: LayoutList,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    key: "overdue" as const,
    label: "Overdue",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div className={`rounded-lg p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold tabular-nums">
                {stats?.[key] ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useStats } from "@/hooks/use-stats";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { TaskDistribution } from "@/components/dashboard/task-distribution";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { OverdueAlert } from "@/components/dashboard/overdue-alert";

export function DashboardContent() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-6">
      {/* Overdue banner — only visible when overdue > 0 */}
      {!isLoading && stats && <OverdueAlert count={stats.overdue} />}

      {/* Metric cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart
          trends={stats?.completionTrends}
          isLoading={isLoading}
        />
        <TaskDistribution stats={stats} isLoading={isLoading} />
      </div>

      {/* Recent activity */}
      <RecentTasks
        tasks={stats?.recentActivity}
        isLoading={isLoading}
      />
    </div>
  );
}

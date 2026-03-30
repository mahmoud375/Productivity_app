export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type TaskStatusValue = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export const TASK_STATUS_COLORS: Record<TaskStatusValue, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export const PAGINATION_LIMIT = 20;

export const QUERY_KEYS = {
  tasks: ["tasks"] as const,
  task: (id: string) => ["tasks", id] as const,
  subtasks: (taskId: string) => ["subtasks", taskId] as const,
  stats: ["stats"] as const,
};

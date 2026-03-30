import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, subtasks } from "@/lib/db/schema";

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
export type Subtask = InferSelectModel<typeof subtasks>;
export type NewSubtask = InferInsertModel<typeof subtasks>;
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskWithSubtasks = Task & { subtasks: Subtask[] };
export type TaskWithProgress = TaskWithSubtasks & {
  progress: number;
  isOverdue: boolean;
};

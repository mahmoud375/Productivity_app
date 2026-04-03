import type { Metadata } from "next";
import { TaskForm } from "@/components/tasks/task-form";

export const metadata: Metadata = { title: "New Task" };

export default function NewTaskPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Task</h1>
        <p className="text-muted-foreground mt-1">
          Add a new task to your list
        </p>
      </div>
      <TaskForm mode="create" />
    </div>
  );
}

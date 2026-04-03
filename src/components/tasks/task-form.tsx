"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createTaskSchema,
  type CreateTaskInput,
  type CreateTaskFormInput,
} from "@/lib/validators/task.schema";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import type { Task } from "@/types/task";

interface TaskFormProps {
  task?: Task;
  mode: "create" | "edit";
}

export function TaskForm({ task, mode }: TaskFormProps) {
  const router = useRouter();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskFormInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status as CreateTaskInput["status"]) ?? "todo",
      startDate: task?.startDate
        ? new Date(task.startDate).toISOString()
        : null,
      endDate: task?.endDate
        ? new Date(task.endDate).toISOString()
        : null,
    },
  });

  async function onSubmit(data: CreateTaskFormInput) {
    // zodResolver applies .default() values, so status is always present at runtime
    const payload = data as CreateTaskInput;
    if (mode === "create") {
      createTask.mutate(payload, {
        onSuccess: (created) => {
          toast.success("Task created!");
          router.push(`/tasks/${created.id}`);
        },
        onError: () => toast.error("Failed to create task"),
      });
    } else {
      updateTask.mutate(payload, {
        onSuccess: () => toast.success("Task updated!"),
        onError: () => toast.error("Failed to update task"),
      });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create New Task" : "Edit Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              defaultValue={task?.status ?? "todo"}
              onValueChange={(v) => {
                if (v) setValue("status", v as CreateTaskInput["status"]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                onChange={(e) =>
                  setValue(
                    "startDate",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null
                  )
                }
                defaultValue={
                  task?.startDate
                    ? new Date(task.startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                onChange={(e) =>
                  setValue(
                    "endDate",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null
                  )
                }
                defaultValue={
                  task?.endDate
                    ? new Date(task.endDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

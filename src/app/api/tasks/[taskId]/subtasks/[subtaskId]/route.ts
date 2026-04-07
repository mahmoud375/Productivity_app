import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tasks, subtasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateSubtaskSchema } from "@/lib/validators/subtask.schema";
import { apiSuccess, apiError } from "@/types/api";

type RouteContext = {
  params: Promise<{ taskId: string; subtaskId: string }>;
};

async function verifyTaskOwnership(taskId: string, userId: string) {
  const [task] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);
  return task;
}

async function autoUpdateTaskStatus(taskId: string) {
  const allSubtasks = await db
    .select({ isCompleted: subtasks.isCompleted })
    .from(subtasks)
    .where(eq(subtasks.taskId, taskId));

  if (allSubtasks.length === 0) return;

  const completedCount = allSubtasks.filter((s) => s.isCompleted).length;

  let newStatus: string;
  if (completedCount === allSubtasks.length) {
    newStatus = "completed";
  } else if (completedCount > 0) {
    newStatus = "in_progress";
  } else {
    newStatus = "todo";
  }

  await db
    .update(tasks)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { taskId, subtaskId } = await context.params;

    const task = await verifyTaskOwnership(taskId, session.user.id);
    if (!task) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    // Verify subtask exists and belongs to task
    const [existing] = await db
      .select({ id: subtasks.id })
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(apiError("Subtask not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const body = await request.json();
    const parsed = updateSubtaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const { title, isCompleted } = parsed.data;

    const updateData: Partial<{
      title: string;
      isCompleted: boolean;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const [updatedSubtask] = await db
      .update(subtasks)
      .set(updateData)
      .where(eq(subtasks.id, subtaskId))
      .returning();

    // Auto-update parent task status when isCompleted changes
    if (isCompleted !== undefined) {
      await autoUpdateTaskStatus(taskId);
    }

    return NextResponse.json(apiSuccess(updatedSubtask));
  } catch (error) {
    console.error("[SUBTASK_PATCH_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { taskId, subtaskId } = await context.params;

    const task = await verifyTaskOwnership(taskId, session.user.id);
    if (!task) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const [existing] = await db
      .select({ id: subtasks.id })
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(apiError("Subtask not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));

    return NextResponse.json(apiSuccess({ message: "Subtask deleted" }));
  } catch (error) {
    console.error("[SUBTASK_DELETE_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

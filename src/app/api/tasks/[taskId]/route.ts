import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tasks, subtasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateTaskSchema } from "@/lib/validators/task.schema";
import { apiSuccess, apiError } from "@/types/api";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { taskId } = await context.params;

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!task) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const taskSubtasks = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId))
      .orderBy(subtasks.sortOrder);

    return NextResponse.json(
      apiSuccess({ ...task, subtasks: taskSubtasks })
    );
  } catch (error) {
    console.error("[TASK_GET_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { taskId } = await context.params;

    // Verify ownership
    const [existing] = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const { title, description, status, startDate, endDate } = parsed.data;

    // Build update values — only include fields that were provided
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateValues.title = title;
    if (description !== undefined)
      updateValues.description = description ?? null;
    if (status !== undefined) updateValues.status = status;
    if (startDate !== undefined)
      updateValues.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateValues.endDate = endDate ? new Date(endDate) : null;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateValues)
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json(apiSuccess(updatedTask));
  } catch (error) {
    console.error("[TASK_PATCH_ERROR]", error);
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

    const { taskId } = await context.params;

    // Verify ownership
    const [existing] = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    // Subtasks cascade via FK
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return NextResponse.json(
      apiSuccess({ message: "Task deleted" })
    );
  } catch (error) {
    console.error("[TASK_DELETE_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

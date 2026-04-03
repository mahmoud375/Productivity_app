import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tasks, subtasks } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { createSubtaskSchema } from "@/lib/validators/subtask.schema";
import { apiSuccess, apiError } from "@/types/api";

type RouteContext = { params: Promise<{ taskId: string }> };

async function verifyTaskOwnership(taskId: string, userId: string) {
  const [task] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);
  return task;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { taskId } = await context.params;

    const task = await verifyTaskOwnership(taskId, session.user.id);
    if (!task) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const subtaskList = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId))
      .orderBy(subtasks.sortOrder);

    return NextResponse.json(apiSuccess(subtaskList));
  } catch (error) {
    console.error("[SUBTASKS_GET_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { taskId } = await context.params;

    const task = await verifyTaskOwnership(taskId, session.user.id);
    if (!task) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const body = await request.json();
    const parsed = createSubtaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    // Get current subtask count for sortOrder
    const [{ total }] = await db
      .select({ total: count() })
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId));

    const [createdSubtask] = await db
      .insert(subtasks)
      .values({
        taskId,
        title: parsed.data.title,
        sortOrder: total,
      })
      .returning();

    return NextResponse.json(apiSuccess(createdSubtask), { status: 201 });
  } catch (error) {
    console.error("[SUBTASKS_POST_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Serialises any thrown value into a plain object safe for JSON.stringify */
function serializeError(e: unknown): Record<string, unknown> {
  if (e instanceof Error) {
    return {
      name: e.name,
      message: e.message,
      // Postgres/Neon driver attaches these
      code: (e as NodeJS.ErrnoException & { code?: string }).code,
      cause: e.cause ? String(e.cause) : undefined,
      stack: e.stack,
    };
  }
  return { raw: String(e) };
}

/** Returns true when the string looks like a non-empty UUID. */
function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

// ─── PATCH /api/tasks/[taskId]/subtasks/[subtaskId] ──────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
      status: 401,
    });
  }
  const userId = session.user.id;

  // ── 2. Params guard ────────────────────────────────────────────────────────
  const params = await context.params;
  const { taskId, subtaskId } = params;

  if (!isValidId(taskId) || !isValidId(subtaskId)) {
    console.error("[SUBTASK_PATCH] Invalid route params", { taskId, subtaskId });
    return NextResponse.json(
      apiError("Invalid route parameters", "BAD_PARAMS"),
      { status: 400 }
    );
  }

  // ── 3. Parse & validate request body ──────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch (e) {
    console.error("[SUBTASK_PATCH] Failed to parse request body", serializeError(e));
    return NextResponse.json(
      apiError("Invalid JSON body", "BAD_REQUEST"),
      { status: 400 }
    );
  }

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

  // ── 4. Verify task ownership ───────────────────────────────────────────────
  let taskRow: { id: string } | undefined;
  try {
    const rows = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);
    taskRow = rows[0];
  } catch (e) {
    const err = serializeError(e);
    console.error("[SUBTASK_PATCH] DB error during task ownership check", err);
    return NextResponse.json(
      apiError("Database error during ownership check", "DB_ERROR"),
      { status: 500, headers: { "X-Debug-Step": "task-ownership" } }
    );
  }

  if (!taskRow) {
    return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
      status: 404,
    });
  }

  // ── 5. Verify subtask exists and belongs to task ───────────────────────────
  let subtaskRow: { id: string } | undefined;
  try {
    const rows = await db
      .select({ id: subtasks.id })
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .limit(1);
    subtaskRow = rows[0];
  } catch (e) {
    const err = serializeError(e);
    console.error("[SUBTASK_PATCH] DB error during subtask existence check", err);
    return NextResponse.json(
      apiError("Database error during subtask lookup", "DB_ERROR"),
      { status: 500, headers: { "X-Debug-Step": "subtask-exists" } }
    );
  }

  if (!subtaskRow) {
    return NextResponse.json(apiError("Subtask not found", "NOT_FOUND"), {
      status: 404,
    });
  }

  // ── 6. Build update payload ────────────────────────────────────────────────
  // Only include fields that were explicitly sent in the request.
  // Never pass `undefined` to Drizzle .set() — it generates a malformed SQL
  // parameter binding that Postgres silently rejects on the Neon HTTP driver.
  const updatePayload: {
    updatedAt: Date;
    title?: string;
    isCompleted?: boolean;
  } = { updatedAt: new Date() };

  if (title !== undefined) updatePayload.title = title;
  if (isCompleted !== undefined) updatePayload.isCompleted = isCompleted;

  // ── 7. Update the subtask ──────────────────────────────────────────────────
  let updatedSubtask: typeof subtasks.$inferSelect;
  try {
    const rows = await db
      .update(subtasks)
      .set(updatePayload)
      .where(eq(subtasks.id, subtaskId))
      .returning();

    if (!rows[0]) {
      // UPDATE returned no rows — subtask disappeared between steps 5 and 7
      console.error("[SUBTASK_PATCH] UPDATE returning() came back empty", {
        subtaskId,
        taskId,
      });
      return NextResponse.json(
        apiError("Subtask update returned no rows", "DB_EMPTY_RESULT"),
        { status: 500, headers: { "X-Debug-Step": "subtask-update" } }
      );
    }

    updatedSubtask = rows[0];
  } catch (e) {
    const err = serializeError(e);
    console.error("[SUBTASK_PATCH] DB error during subtask UPDATE", err, {
      subtaskId,
      taskId,
      updatePayload,
    });
    return NextResponse.json(
      {
        ...apiError("Database error during subtask update", "DB_ERROR"),
        debug: err,
      },
      { status: 500, headers: { "X-Debug-Step": "subtask-update" } }
    );
  }

  // ── 8. Auto-update parent task status ─────────────────────────────────────
  // Only runs when `isCompleted` was part of the update payload.
  if (isCompleted !== undefined) {
    // 8a. Re-fetch ALL subtask completion states for the parent task.
    //     This read happens AFTER the subtask UPDATE above has committed,
    //     so it always reflects the new state.
    let allSubtaskStates: { isCompleted: boolean }[];
    try {
      allSubtaskStates = await db
        .select({ isCompleted: subtasks.isCompleted })
        .from(subtasks)
        .where(eq(subtasks.taskId, taskId));
    } catch (e) {
      const err = serializeError(e);
      console.error(
        "[SUBTASK_PATCH] DB error fetching sibling subtasks for status rollup",
        err,
        { taskId }
      );
      // Non-fatal: return the updated subtask; just skip task status sync.
      // The parent status will be stale until the next mutation corrects it.
      console.warn("[SUBTASK_PATCH] Skipping task status sync due to DB error");
      return NextResponse.json(apiSuccess(updatedSubtask));
    }

    // 8b. Compute new parent task status.
    let newStatus: "todo" | "in_progress" | "completed";
    if (allSubtaskStates.length === 0) {
      newStatus = "todo";
    } else {
      const completedCount = allSubtaskStates.filter((s) => s.isCompleted === true).length;
      if (completedCount === allSubtaskStates.length) {
        newStatus = "completed";
      } else if (completedCount > 0) {
        newStatus = "in_progress";
      } else {
        newStatus = "todo";
      }
    }

    // 8c. Persist new parent task status.
    try {
      await db
        .update(tasks)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));
    } catch (e) {
      const err = serializeError(e);
      console.error(
        "[SUBTASK_PATCH] DB error during parent task status UPDATE",
        err,
        { taskId, newStatus }
      );
      // Non-fatal: subtask is correctly saved; just status sync failed.
      // Log clearly so we can see it in Vercel Runtime Logs.
      console.warn("[SUBTASK_PATCH] Subtask saved but parent task status sync failed.");
    }
  }

  // ── 9. Return success ──────────────────────────────────────────────────────
  return NextResponse.json(apiSuccess(updatedSubtask));
}

// ─── DELETE /api/tasks/[taskId]/subtasks/[subtaskId] ─────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
      status: 401,
    });
  }
  const userId = session.user.id;

  // ── 2. Params guard ────────────────────────────────────────────────────────
  const params = await context.params;
  const { taskId, subtaskId } = params;

  if (!isValidId(taskId) || !isValidId(subtaskId)) {
    console.error("[SUBTASK_DELETE] Invalid route params", { taskId, subtaskId });
    return NextResponse.json(
      apiError("Invalid route parameters", "BAD_PARAMS"),
      { status: 400 }
    );
  }

  // ── 3. Verify task ownership ───────────────────────────────────────────────
  try {
    const rows = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (!rows[0]) {
      return NextResponse.json(apiError("Task not found", "NOT_FOUND"), {
        status: 404,
      });
    }
  } catch (e) {
    const err = serializeError(e);
    console.error("[SUBTASK_DELETE] DB error during task ownership check", err);
    return NextResponse.json(
      apiError("Database error during ownership check", "DB_ERROR"),
      { status: 500 }
    );
  }

  // ── 4. Verify subtask exists ───────────────────────────────────────────────
  try {
    const rows = await db
      .select({ id: subtasks.id })
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .limit(1);

    if (!rows[0]) {
      return NextResponse.json(apiError("Subtask not found", "NOT_FOUND"), {
        status: 404,
      });
    }
  } catch (e) {
    const err = serializeError(e);
    console.error("[SUBTASK_DELETE] DB error during subtask lookup", err);
    return NextResponse.json(
      apiError("Database error during subtask lookup", "DB_ERROR"),
      { status: 500 }
    );
  }

  // ── 5. Delete ──────────────────────────────────────────────────────────────
  try {
    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));
  } catch (e) {
    const err = serializeError(e);
    console.error("[SUBTASK_DELETE] DB error during DELETE", err, { subtaskId });
    return NextResponse.json(
      apiError("Database error during subtask deletion", "DB_ERROR"),
      { status: 500 }
    );
  }

  return NextResponse.json(apiSuccess({ message: "Subtask deleted" }));
}

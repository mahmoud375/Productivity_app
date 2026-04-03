import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, ilike, and, desc, asc, count, type SQL } from "drizzle-orm";
import {
  createTaskSchema,
  taskQuerySchema,
} from "@/lib/validators/task.schema";
import { apiSuccess, apiError } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = taskQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.issues[0]?.message ?? "Invalid query",
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const { status, search, sort, order, page, limit } = parsed.data;

    // Build WHERE conditions
    const conditions: SQL[] = [eq(tasks.userId, session.user.id)];

    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    if (search) {
      conditions.push(ilike(tasks.title, `%${search}%`));
    }

    const whereClause = and(...conditions);

    // Sort mapping
    const sortColumnMap = {
      created_at: tasks.createdAt,
      updated_at: tasks.updatedAt,
      end_date: tasks.endDate,
      title: tasks.title,
    } as const;

    const sortColumn = sortColumnMap[sort];
    const orderFn = order === "asc" ? asc : desc;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(tasks)
      .where(whereClause);

    // Get paginated tasks
    const offset = (page - 1) * limit;
    const taskList = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      apiSuccess({
        tasks: taskList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error("[TASKS_GET_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
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

    const [createdTask] = await db
      .insert(tasks)
      .values({
        userId: session.user.id,
        title,
        description: description ?? null,
        status: status ?? "todo",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      })
      .returning();

    return NextResponse.json(apiSuccess(createdTask), { status: 201 });
  } catch (error) {
    console.error("[TASKS_POST_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { apiSuccess, apiError } from "@/types/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const userId = session.user.id;

    // ── Single aggregation query: all counts computed in the database ──
    const [counts] = await db
      .select({
        totalTasks: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
        inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')::int`,
        overdue: sql<number>`count(*) filter (where ${tasks.endDate} < now() and ${tasks.status} != 'completed')::int`,
      })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // ── Completion trends: tasks completed per day over the last 7 days ──
    // Uses generate_series to ensure all 7 days are present even with 0 completions
    const completionTrends = await db.execute<{
      date: string;
      count: number;
    }>(sql`
      SELECT
        d::date::text AS date,
        COALESCE(count(${tasks.id}), 0)::int AS count
      FROM generate_series(
        (current_date - interval '6 days'),
        current_date,
        interval '1 day'
      ) AS d
      LEFT JOIN ${tasks}
        ON ${tasks.userId} = ${userId}
        AND ${tasks.status} = 'completed'
        AND ${tasks.updatedAt}::date = d::date
      GROUP BY d
      ORDER BY d
    `);

    // ── Recent activity: 5 most recently updated tasks ──
    const recentActivity = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.updatedAt))
      .limit(5);

    return NextResponse.json(
      apiSuccess({
        totalTasks: counts.totalTasks,
        completed: counts.completed,
        inProgress: counts.inProgress,
        overdue: counts.overdue,
        completionTrends,
        recentActivity,
      })
    );
  } catch (error) {
    console.error("[STATS_GET_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

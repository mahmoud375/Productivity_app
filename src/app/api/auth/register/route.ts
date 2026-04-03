import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validators/auth.schema";
import { apiSuccess, apiError } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json(apiError(firstError, "VALIDATION_ERROR"), {
        status: 400,
      });
    }

    const { name, email, password } = parsed.data;

    // Check if email already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        apiError("Email already registered", "EMAIL_EXISTS"),
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new user
    await db.insert(users).values({
      name,
      email,
      passwordHash,
    });

    return NextResponse.json(
      apiSuccess({ message: "Account created successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      apiError("Something went wrong", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

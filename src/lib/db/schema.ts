import { pgTable, uuid, varchar, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

// ─── Auth Tables (NextAuth.js compatible) ────────────────────────────

export const users = pgTable("users", {
  id:              uuid("id").defaultRandom().primaryKey(),
  name:            varchar("name", { length: 255 }),
  email:           varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:    varchar("password_hash", { length: 255 }),   // null for OAuth users
  image:           varchar("image", { length: 512 }),
  emailVerifiedAt: timestamp("email_verified_at", { mode: "date" }),
  createdAt:       timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:       timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id:                uuid("id").defaultRandom().primaryKey(),
  userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              varchar("type", { length: 50 }).notNull(),           // "oauth" | "credentials"
  provider:          varchar("provider", { length: 50 }).notNull(),       // "google" | "github" | "credentials"
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken:       text("access_token"),
  refreshToken:      text("refresh_token"),
  expiresAt:         integer("expires_at"),
  tokenType:         varchar("token_type", { length: 50 }),
  scope:             varchar("scope", { length: 255 }),
  idToken:           text("id_token"),
});

export const sessions = pgTable("sessions", {
  id:           uuid("id").defaultRandom().primaryKey(),
  userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token:      varchar("token", { length: 255 }).notNull().unique(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
});

// ─── Application Tables ──────────────────────────────────────────────

/**
 * Task statuses:
 *   "todo"        — Not started
 *   "in_progress" — At least one subtask completed, or manually set
 *   "completed"   — All subtasks completed, or manually marked
 *   "overdue"     — Computed: end_date < now AND status != "completed"
 *                   (this is a virtual status, NOT stored in DB)
 */
export const tasks = pgTable("tasks", {
  id:          uuid("id").defaultRandom().primaryKey(),
  userId:      uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status:      varchar("status", { length: 20 }).notNull().default("todo"),
  startDate:   timestamp("start_date", { mode: "date" }),
  endDate:     timestamp("end_date", { mode: "date" }),
  sortOrder:   integer("sort_order").notNull().default(0),
  createdAt:   timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:   timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const subtasks = pgTable("subtasks", {
  id:          uuid("id").defaultRandom().primaryKey(),
  taskId:      uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  sortOrder:   integer("sort_order").notNull().default(0),
  createdAt:   timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:   timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

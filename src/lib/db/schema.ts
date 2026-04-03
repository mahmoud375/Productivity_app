import { pgTable, uuid, varchar, text, boolean, integer, timestamp, index, primaryKey } from "drizzle-orm/pg-core";

// ─── Auth Tables (NextAuth.js v5 compatible) ─────────────────────────

export const users = pgTable("users", {
  id:              uuid("id").defaultRandom().primaryKey(),
  name:            varchar("name", { length: 255 }),
  email:           varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:    varchar("password_hash", { length: 255 }),   // null for OAuth users
  emailVerified:   timestamp("email_verified", { mode: "date" }),
  image:           varchar("image", { length: 512 }),
  createdAt:       timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:       timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId:            uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              varchar("type", { length: 50 }).notNull(),
  provider:          varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        varchar("token_type", { length: 50 }),
  scope:             varchar("scope", { length: 255 }),
  id_token:          text("id_token"),
  session_state:     varchar("session_state", { length: 255 }),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
  index("idx_accounts_user_id").on(account.userId),
]);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId:       uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
}, (table) => [
  index("idx_sessions_user_id").on(table.userId),
]);

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token:      varchar("token", { length: 255 }).notNull(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
]);

// ─── Application Tables ──────────────────────────────────────────────

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
}, (table) => [
  index("idx_tasks_user_id").on(table.userId),
  index("idx_tasks_status").on(table.status),
  index("idx_tasks_end_date").on(table.endDate),
]);

export const subtasks = pgTable("subtasks", {
  id:          uuid("id").defaultRandom().primaryKey(),
  taskId:      uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  sortOrder:   integer("sort_order").notNull().default(0),
  createdAt:   timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:   timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("idx_subtasks_task_id").on(table.taskId),
]);

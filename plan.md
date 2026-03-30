# TaskFlow — Production-Ready Productivity Web App

## 1. Project Name & Description

**TaskFlow** is a modern, full-stack productivity web application that enables users to manage their tasks with rich features including sub-task checklists, date ranges, auto-calculated progress tracking, and a comprehensive statistics dashboard. Built with a serverless-first architecture for instant global deployments, zero cold-start database connections, and edge-ready authentication.

### Core Value Proposition

| Feature               | Description                                                         |
| :--------------------- | :------------------------------------------------------------------- |
| Task Management        | CRUD tasks with title, description, date range, and status tracking |
| Sub-task Checklists    | Nested checklist items within each task                             |
| Auto Progress Tracking | Progress bar calculated from completed sub-tasks ratio              |
| Statistics Dashboard   | Visual analytics: total, completed, in-progress, overdue counts     |
| Responsive Design      | Mobile-first, fully responsive across all breakpoints               |

---

## 2. Full Tech Stack

### Frontend

| Technology       | Version | Justification                                                                                                                                                   |
| :--------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js**      | 15+     | App Router with RSC (React Server Components), streaming, server actions, parallel routes. The industry standard for production React apps.                     |
| **TypeScript**   | 5.x     | Non-negotiable for production. Catches bugs at compile time, enables IDE autocompletion, and serves as living documentation.                                    |
| **TailwindCSS**  | 4.x     | Utility-first CSS — eliminates context switching, ensures design consistency, purges unused CSS in production for minimal bundle size.                           |
| **shadcn/ui**    | latest  | Not a library but a collection of copy-paste components built on Radix UI primitives. Fully customizable, accessible (WAI-ARIA), and zero vendor lock-in.       |
| **Lucide React** | latest  | Consistent, tree-shakeable icon library that pairs natively with shadcn/ui.                                                                                     |
| **Recharts**     | 2.x     | Declarative charting library built on D3 with React components. Lightweight, composable, and supports responsive containers.                                    |

### Backend & Data

| Technology                   | Version | Justification                                                                                                                                                                                                              |
| :--------------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Neon (Serverless Postgres)** | —       | Serverless PostgreSQL with branch-per-PR, autoscaling to zero, and sub-second cold starts. Native HTTP/WebSocket driver eliminates connection pool exhaustion in serverless functions.                                       |
| **Drizzle ORM**              | latest  | **Chosen over Prisma.** SQL-first ORM with ~7KB bundle (vs Prisma's Rust binary). Zero cold-start overhead, native Neon driver support, TypeScript inference without codegen, and full Edge Runtime compatibility. Ideal for serverless. |

### Authentication

| Technology              | Version | Justification                                                                                                                                                                                                                                                  |
| :---------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NextAuth.js (Auth.js)** | v5      | **Chosen over Clerk.** Full data ownership — user records live in our Neon database, not a third party. Zero per-MAU cost. No vendor lock-in. Supports credentials, OAuth (Google/GitHub), and JWT/session strategies. Ideal for apps that must own their data. |

### State & Data Fetching

| Technology             | Version | Justification                                                                                                                                                                       |
| :--------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TanStack React Query** | v5      | Server-state management with automatic caching, background refetching, optimistic updates, and stale-while-revalidate. Far superior to manual `useEffect` + `useState` patterns.     |
| **Zustand**            | v5      | Lightweight (~1KB) client-state management for UI state (modals, sidebar toggle, theme). No boilerplate, no providers, simple selectors.                                             |

### Validation

| Technology | Version | Justification                                                                                                |
| :--------- | :------ | :----------------------------------------------------------------------------------------------------------- |
| **Zod**    | v3      | Runtime schema validation with TypeScript type inference. Shared schemas between client forms and API routes. |

### Deployment

| Technology | Justification                                                                                                                                        |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vercel** | Native Next.js platform with edge functions, preview deployments per PR, built-in analytics, and automatic image optimization. Zero-config deploys.  |

### Dev Tooling

| Tool                | Purpose                                              |
| :------------------ | :--------------------------------------------------- |
| **ESLint**          | Code quality and Next.js specific rules              |
| **Prettier**        | Consistent formatting                                |
| **Husky + lint-staged** | Pre-commit hooks for linting/formatting          |
| **drizzle-kit**     | Database migrations, schema push, and studio         |

---

## 3. Folder & File Structure

```
taskflow/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png                     # Open Graph image for social sharing
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (fonts, providers, metadata)
│   │   ├── page.tsx                     # Landing page (public)
│   │   ├── globals.css                  # Tailwind directives + global styles
│   │   │
│   │   ├── (auth)/                      # Route group — auth pages (no layout nesting)
│   │   │   ├── layout.tsx               # Auth-specific layout (centered card)
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Login page
│   │   │   └── register/
│   │   │       └── page.tsx             # Register page
│   │   │
│   │   ├── (dashboard)/                 # Route group — protected dashboard
│   │   │   ├── layout.tsx               # Dashboard layout (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Main dashboard with stats
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx             # Task list view (all tasks)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx         # Create new task
│   │   │   │   └── [taskId]/
│   │   │   │       ├── page.tsx         # Task detail / edit view
│   │   │   │       └── loading.tsx      # Skeleton loader for task detail
│   │   │   └── settings/
│   │   │       └── page.tsx             # User settings / profile
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts         # NextAuth.js catch-all handler
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts             # GET (list) / POST (create) tasks
│   │   │   │   ├── [taskId]/
│   │   │   │   │   ├── route.ts         # GET / PATCH / DELETE single task
│   │   │   │   │   └── subtasks/
│   │   │   │   │       ├── route.ts     # GET / POST subtasks for a task
│   │   │   │   │       └── [subtaskId]/
│   │   │   │   │           └── route.ts # PATCH / DELETE single subtask
│   │   │   └── stats/
│   │   │       └── route.ts             # GET dashboard statistics
│   │   │
│   │   └── not-found.tsx                # Custom 404 page
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── avatar.tsx
│   │   │
│   │   ├── layout/                      # Layout components
│   │   │   ├── sidebar.tsx              # Dashboard sidebar navigation
│   │   │   ├── topbar.tsx               # Top navigation bar
│   │   │   ├── mobile-nav.tsx           # Mobile slide-out navigation
│   │   │   └── user-menu.tsx            # User avatar dropdown (logout, settings)
│   │   │
│   │   ├── auth/                        # Auth-specific components
│   │   │   ├── login-form.tsx           # Login form with validation
│   │   │   ├── register-form.tsx        # Registration form with validation
│   │   │   ├── social-login-buttons.tsx # Google / GitHub OAuth buttons
│   │   │   └── auth-guard.tsx           # Client-side session guard wrapper
│   │   │
│   │   ├── tasks/                       # Task-specific components
│   │   │   ├── task-card.tsx            # Individual task card (list view)
│   │   │   ├── task-form.tsx            # Create / Edit task form
│   │   │   ├── task-list.tsx            # Filterable, sortable task list
│   │   │   ├── task-filters.tsx         # Filter bar (status, date range, search)
│   │   │   ├── task-detail.tsx          # Full task detail view
│   │   │   ├── task-progress-bar.tsx    # Auto-calculated progress bar
│   │   │   ├── task-date-range.tsx      # Date range picker (start → end)
│   │   │   ├── task-status-badge.tsx    # Color-coded status badge
│   │   │   └── task-delete-dialog.tsx   # Confirmation dialog for deletion
│   │   │
│   │   ├── subtasks/                    # Sub-task components
│   │   │   ├── subtask-list.tsx         # List of sub-tasks (checklist)
│   │   │   ├── subtask-item.tsx         # Single sub-task row (checkbox + text)
│   │   │   └── subtask-add-input.tsx    # Inline input to add new sub-task
│   │   │
│   │   ├── dashboard/                   # Dashboard-specific components
│   │   │   ├── stats-cards.tsx          # Total / Completed / In-Progress / Overdue
│   │   │   ├── progress-chart.tsx       # Circular or bar chart (Recharts)
│   │   │   ├── recent-tasks.tsx         # Recent activity feed
│   │   │   ├── task-distribution.tsx    # Pie/donut chart by status
│   │   │   └── overdue-alert.tsx        # Alert banner for overdue tasks
│   │   │
│   │   └── shared/                      # Shared / generic components
│   │       ├── page-header.tsx          # Page title + action buttons
│   │       ├── empty-state.tsx          # Empty state illustration + CTA
│   │       ├── loading-spinner.tsx      # Global loading indicator
│   │       ├── error-boundary.tsx       # React error boundary wrapper
│   │       └── theme-toggle.tsx         # Dark / Light mode switch
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                # Drizzle client initialization (Neon driver)
│   │   │   ├── schema.ts               # All Drizzle table definitions
│   │   │   ├── relations.ts            # Drizzle table relations
│   │   │   └── migrate.ts              # Migration runner script
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.config.ts           # NextAuth.js configuration
│   │   │   ├── auth.ts                  # Auth helper (getServerSession wrapper)
│   │   │   └── providers.ts             # OAuth + Credentials provider setup
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.schema.ts           # Zod schemas: login, register
│   │   │   ├── task.schema.ts           # Zod schemas: create/update task
│   │   │   └── subtask.schema.ts        # Zod schemas: create/update subtask
│   │   │
│   │   ├── utils.ts                     # General utilities (cn(), formatDate, etc.)
│   │   ├── constants.ts                 # App-wide constants (task statuses, etc.)
│   │   └── api-client.ts               # Typed fetch wrapper for API routes
│   │
│   ├── hooks/
│   │   ├── use-tasks.ts                 # React Query hooks for task CRUD
│   │   ├── use-subtasks.ts              # React Query hooks for subtask CRUD
│   │   ├── use-stats.ts                 # React Query hook for dashboard stats
│   │   ├── use-debounce.ts              # Debounce hook for search input
│   │   └── use-media-query.ts           # Responsive breakpoint detection
│   │
│   ├── stores/
│   │   ├── ui-store.ts                  # Zustand: sidebar state, modals, theme
│   │   └── task-filter-store.ts         # Zustand: active filters, sort order
│   │
│   ├── types/
│   │   ├── index.ts                     # Re-exports
│   │   ├── task.ts                      # Task, SubTask, TaskStatus types
│   │   ├── auth.ts                      # User, Session extension types
│   │   └── api.ts                       # API response envelope types
│   │
│   └── middleware.ts                    # NextAuth.js middleware for route protection
│
├── drizzle/
│   └── migrations/                      # Generated SQL migration files
│       └── 0000_initial.sql
│
├── .env.local                           # Local environment variables
├── .env.example                         # Template for environment variables
├── .eslintrc.json                       # ESLint configuration
├── .prettierrc                          # Prettier configuration
├── .gitignore
├── components.json                      # shadcn/ui configuration
├── drizzle.config.ts                    # Drizzle Kit configuration
├── next.config.ts                       # Next.js configuration
├── tailwind.config.ts                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 4. Database Schema

### Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ TASKS : "creates"
    USERS ||--o{ ACCOUNTS : "has"
    USERS ||--o{ SESSIONS : "has"
    TASKS ||--o{ SUBTASKS : "contains"

    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar image
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        varchar provider
        varchar provider_account_id
        varchar type
        text access_token
        text refresh_token
        int expires_at
    }

    SESSIONS {
        uuid id PK
        uuid user_id FK
        varchar session_token UK
        timestamp expires
    }

    VERIFICATION_TOKENS {
        varchar identifier
        varchar token UK
        timestamp expires
    }

    TASKS {
        uuid id PK
        uuid user_id FK
        varchar title
        text description
        varchar status
        timestamp start_date
        timestamp end_date
        int sort_order
        timestamp created_at
        timestamp updated_at
    }

    SUBTASKS {
        uuid id PK
        uuid task_id FK
        varchar title
        boolean is_completed
        int sort_order
        timestamp created_at
        timestamp updated_at
    }
```

### Drizzle Schema Definition

```typescript
// src/lib/db/schema.ts

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
```

### Drizzle Relations

```typescript
// src/lib/db/relations.ts

import { relations } from "drizzle-orm";
import { users, accounts, sessions, tasks, subtasks } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  tasks:    many(tasks),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user:     one(users,    { fields: [tasks.userId], references: [users.id] }),
  subtasks: many(subtasks),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, { fields: [subtasks.taskId], references: [tasks.id] }),
}));
```

### Database Indexes (Performance)

```sql
-- Applied via migration
CREATE INDEX idx_tasks_user_id     ON tasks(user_id);
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_end_date    ON tasks(end_date);
CREATE INDEX idx_subtasks_task_id  ON subtasks(task_id);
CREATE INDEX idx_accounts_user_id  ON accounts(user_id);
CREATE INDEX idx_sessions_user_id  ON sessions(user_id);
CREATE INDEX idx_sessions_token    ON sessions(session_token);
```

---

## 5. API Routes Plan

All API routes are protected via NextAuth.js middleware (except auth routes). Every response follows a consistent JSON envelope.

### Response Envelope

```typescript
// Success
{ "data": T, "error": null }

// Error
{ "data": null, "error": { "message": string, "code": string } }
```

### Auth Routes

| Method | Endpoint                       | Description                           | Auth |
| :----- | :----------------------------- | :------------------------------------ | :--- |
| POST   | `/api/auth/[...nextauth]`      | NextAuth.js handler (login, callback) | No   |
| POST   | `/api/auth/register`           | Custom register endpoint (if using credentials) | No   |

> Note: NextAuth.js v5 handles `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`, `/api/auth/callback/*` internally.

### Task Routes

| Method | Endpoint                       | Description                           | Auth    | Request Body / Query Params                                     |
| :----- | :----------------------------- | :------------------------------------ | :------ | :-------------------------------------------------------------- |
| GET    | `/api/tasks`                   | List all tasks for current user       | ✅      | `?status=todo&search=keyword&sort=created_at&order=desc&page=1&limit=20` |
| POST   | `/api/tasks`                   | Create a new task                     | ✅      | `{ title, description?, startDate?, endDate?, subtasks?[] }`    |
| GET    | `/api/tasks/[taskId]`          | Get single task with subtasks         | ✅      | —                                                               |
| PATCH  | `/api/tasks/[taskId]`          | Update task fields                    | ✅      | `{ title?, description?, status?, startDate?, endDate? }`       |
| DELETE | `/api/tasks/[taskId]`          | Delete task and all subtasks (cascade)| ✅      | —                                                               |

### Subtask Routes

| Method | Endpoint                                    | Description              | Auth | Request Body                    |
| :----- | :------------------------------------------ | :----------------------- | :--- | :------------------------------ |
| GET    | `/api/tasks/[taskId]/subtasks`              | List subtasks for a task | ✅   | —                               |
| POST   | `/api/tasks/[taskId]/subtasks`              | Add subtask to a task    | ✅   | `{ title }`                     |
| PATCH  | `/api/tasks/[taskId]/subtasks/[subtaskId]`  | Toggle / rename subtask  | ✅   | `{ title?, isCompleted? }`      |
| DELETE | `/api/tasks/[taskId]/subtasks/[subtaskId]`  | Remove a subtask         | ✅   | —                               |

### Statistics Routes

| Method | Endpoint        | Description                   | Auth | Response Shape                                                                  |
| :----- | :-------------- | :---------------------------- | :--- | :------------------------------------------------------------------------------ |
| GET    | `/api/stats`    | Dashboard stats for user      | ✅   | `{ totalTasks, completed, inProgress, overdue, completionRate, recentActivity[] }` |

### Authorization Logic

Every protected endpoint:
1. Extracts `session.user.id` from NextAuth.js
2. Scopes all DB queries with `WHERE user_id = session.user.id`
3. For `[taskId]` params — verifies the task belongs to the authenticated user before any operation
4. Returns `401` for unauthenticated, `403` for unauthorized (wrong user), `404` for not found

---

## 6. UI Pages & Components Plan

### Page Map

```
/                       → Landing page (public)
/login                  → Login form
/register               → Registration form
/dashboard              → Statistics overview (protected)
/tasks                  → Task list with filters (protected)
/tasks/new              → Create new task (protected)
/tasks/[taskId]         → Task detail & edit (protected)
/settings               → User profile & preferences (protected)
```

### Page Details

#### Landing Page (`/`)
- **Hero section** — Headline, subheadline, CTA "Get Started Free"
- **Features section** — 3-column grid with icons
- **Footer** — Links, copyright

#### Login (`/login`)
- **LoginForm** — Email + password inputs with Zod validation
- **SocialLoginButtons** — Google and GitHub OAuth
- Link to `/register`

#### Register (`/register`)
- **RegisterForm** — Name, email, password, confirm password
- Password strength indicator
- **SocialLoginButtons** — Google and GitHub OAuth
- Link to `/login`

#### Dashboard (`/dashboard`)
- **StatsCards** — 4 metric cards: Total Tasks, Completed, In-Progress, Overdue
- **ProgressChart** — Bar chart of tasks completed over the last 7 days
- **TaskDistribution** — Donut chart showing task status distribution
- **RecentTasks** — List of 5 most recently updated tasks
- **OverdueAlert** — Dismissible banner if overdue tasks exist

#### Task List (`/tasks`)
- **TaskFilters** — Status dropdown, search input, date range filter, sort selector
- **TaskList** — Grid/list toggle, paginated task cards
- **TaskCard** — Title, status badge, date range, progress bar, subtask count
- **EmptyState** — Shown when no tasks exist, with "Create your first task" CTA
- FAB (floating action button) on mobile for quick task creation

#### Create Task (`/tasks/new`)
- **TaskForm** — Title, description (textarea), date range picker
- **SubtaskAddInput** — Inline input to add sub-tasks before creating
- **SubtaskList** — Preview of added sub-tasks with reorder and delete
- Submit button with loading state

#### Task Detail (`/tasks/[taskId]`)
- **TaskDetail** — Full task information, editable inline
- **TaskProgressBar** — Auto-calculated from subtask completion ratio
- **SubtaskList** — Interactive checklist with toggle, inline edit, delete, reorder
- **SubtaskAddInput** — Add new subtasks on the fly
- **TaskDeleteDialog** — Destructive action confirmation
- Breadcrumb navigation: Dashboard > Tasks > Task Title

#### Settings (`/settings`)
- Display name and email (read-only for OAuth users)
- Password change form (credentials users only)
- Theme preference (dark/light/system)
- Delete account with confirmation

### Responsive Breakpoints

| Breakpoint | Width    | Layout Behavior                                     |
| :--------- | :------- | :-------------------------------------------------- |
| `sm`       | ≥640px   | Stack → side-by-side for cards                      |
| `md`       | ≥768px   | Sidebar collapses to hamburger icon                 |
| `lg`       | ≥1024px  | Full sidebar visible, 2-column task grid            |
| `xl`       | ≥1280px  | 3-column task grid, expanded dashboard charts       |

---

## 7. Auth Flow

### Registration Flow

```
User clicks "Register"
    │
    ▼
[Register Page] ── fills form (name, email, password)
    │
    ▼
[Client] Zod validates inputs
    │  ✗ → Show inline validation errors
    ▼  ✓
[POST /api/auth/register]
    │
    ▼
[Server] Zod validates again (never trust client)
    │
    ▼
[Server] Check if email already exists
    │  ✓ exists → Return 409 "Email already registered"
    ▼  ✗ new
[Server] Hash password with bcrypt (12 salt rounds)
    │
    ▼
[Server] Insert user into `users` table
    │
    ▼
[Server] Auto-login: create session via NextAuth.js signIn()
    │
    ▼
[Redirect] → /dashboard
```

### Login Flow (Credentials)

```
User clicks "Login"
    │
    ▼
[Login Page] ── fills form (email, password)
    │
    ▼
[Client] Zod validates inputs
    │
    ▼
[NextAuth.js signIn("credentials", { email, password })]
    │
    ▼
[Server] CredentialsProvider.authorize():
    │   1. Find user by email
    │   2. Compare password with bcrypt
    │   3. Return user object or null
    │
    ├── ✗ null → "Invalid email or password" error
    ▼  ✓
[NextAuth.js] Creates JWT + sets httpOnly cookie
    │
    ▼
[Redirect] → /dashboard
```

### Login Flow (OAuth — Google/GitHub)

```
User clicks "Continue with Google"
    │
    ▼
[NextAuth.js signIn("google")]
    │
    ▼
[Redirect] → Google OAuth consent screen
    │
    ▼
[Google callback] → /api/auth/callback/google
    │
    ▼
[NextAuth.js] signIn callback:
    │   1. Check if account exists in `accounts` table
    │   2. If new → create user + account record
    │   3. If existing → link to existing user
    │
    ▼
[NextAuth.js] Creates JWT + sets httpOnly cookie
    │
    ▼
[Redirect] → /dashboard
```

### Session & Route Protection

```
[middleware.ts]
    │
    ▼
Every request to /(dashboard)/* routes:
    │
    ▼
[NextAuth.js getToken()] — check JWT from cookie
    │
    ├── ✗ No token → Redirect to /login?callbackUrl=<original-url>
    ▼  ✓
Allow request to proceed
    │
    ▼
[Server Component] getServerSession() — access user data
    │
    ▼
[API Route] getServerSession() — scope DB queries to user
```

### Session Strategy: JWT

| Config Key     | Value                                                        |
| :------------- | :----------------------------------------------------------- |
| Strategy       | `jwt`                                                        |
| Max Age        | 30 days                                                      |
| Update Age     | 24 hours (refresh token silently)                            |
| Cookie Name    | `__Secure-next-auth.session-token` (HTTPS) or `next-auth.session-token` (dev) |
| Cookie Flags   | `httpOnly`, `secure`, `sameSite: lax`                        |

---

## 8. Security Measures

### Input Validation

| Layer     | Strategy                                                                                   |
| :-------- | :----------------------------------------------------------------------------------------- |
| Client    | Zod schemas validate form data before submission. Show inline errors immediately.           |
| Server    | Same Zod schemas re-validate in every API route handler. **Never trust client input.**      |
| Database  | Drizzle ORM uses parameterized queries — immune to SQL injection by default.                |
| Output    | React auto-escapes JSX output. No `dangerouslySetInnerHTML` usage.                          |

### Authentication Security

| Measure             | Implementation                                                        |
| :------------------ | :-------------------------------------------------------------------- |
| Password Hashing    | bcrypt with 12 salt rounds (intentionally slow, GPU-resistant)        |
| JWT Signing         | Signed with `NEXTAUTH_SECRET` (256-bit minimum, generated via `openssl rand -base64 32`) |
| Cookie Security     | `httpOnly` (no JS access), `secure` (HTTPS only), `sameSite: lax`    |
| CSRF Protection     | NextAuth.js includes built-in CSRF token validation on all auth endpoints |
| Session Expiry      | 30-day max age with 24-hour sliding window refresh                    |

### API Security

| Measure                | Implementation                                                                |
| :--------------------- | :---------------------------------------------------------------------------- |
| Rate Limiting          | Use `@upstash/ratelimit` with Redis — 100 req/min per IP for auth, 300 for API |
| Authorization Scoping  | Every query includes `WHERE user_id = session.user.id` — users cannot access others' data |
| Ownership Verification | Before update/delete, verify the resource belongs to the authenticated user    |
| Input Sanitization     | Zod `.trim()`, `.max(length)` on all string inputs                            |

### Infrastructure Security

| Measure                | Implementation                                                                      |
| :--------------------- | :----------------------------------------------------------------------------------- |
| Environment Variables  | All secrets in `.env.local` (never committed). Vercel encrypted env vars in production |
| HTTPS                  | Enforced by Vercel. All cookies set with `secure` flag in production                 |
| Security Headers       | Configured in `next.config.ts`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Dependency Auditing    | `pnpm audit` in CI pipeline. Dependabot for automated vulnerability alerts           |

### `next.config.ts` Security Headers

```typescript
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
];
```

---

## 9. Performance Strategy

### Server-Side

| Strategy               | Implementation                                                                              |
| :--------------------- | :------------------------------------------------------------------------------------------ |
| React Server Components | Default for all pages — zero client JS for static content. Only `"use client"` where needed. |
| Streaming & Suspense   | Wrap data-fetching components in `<Suspense>` with skeleton fallbacks for instant page shells |
| Edge Runtime            | Auth middleware runs on Vercel Edge for <10ms response times globally                        |
| Database Connection     | Neon serverless driver over HTTP — no persistent connection pool needed, no cold-start tax    |
| Query Optimization      | Indexed columns (see schema), paginated queries, `SELECT` only needed columns                |

### Client-Side

| Strategy               | Implementation                                                                              |
| :--------------------- | :------------------------------------------------------------------------------------------ |
| React Query Caching    | `staleTime: 5min` for task list, `gcTime: 30min`. Background refetch on window focus.       |
| Optimistic Updates     | Toggle subtask checkbox → immediately update UI → sync with server. Rollback on failure.     |
| Code Splitting         | Next.js automatic route-based splitting. Heavy components via `dynamic(() => import(...))`.  |
| Lazy Loading           | Charts loaded only when dashboard page is visited. `loading="lazy"` on images.               |
| Debounced Search       | Search input waits 300ms after last keystroke before API call.                                |
| Prefetching            | `<Link prefetch>` for dashboard → tasks navigation. React Query `prefetchQuery` on hover.    |

### Bundle & Assets

| Strategy               | Implementation                                                           |
| :--------------------- | :----------------------------------------------------------------------- |
| TailwindCSS Purge      | Automatic in production — only used utility classes ship to client        |
| Font Optimization      | `next/font` for Inter — self-hosted, zero layout shift, font subsetting  |
| Image Optimization     | `next/image` with automatic WebP conversion, lazy loading, blur placeholder |
| Tree Shaking           | Import only needed icons from `lucide-react`. Import specific Recharts components. |

### Monitoring

| Tool                   | Purpose                                                                  |
| :--------------------- | :----------------------------------------------------------------------- |
| Vercel Analytics       | Core Web Vitals (LCP, FID, CLS), page load times                        |
| Vercel Speed Insights  | Real-user performance monitoring per route                               |
| Sentry (optional)      | Error tracking with source maps, performance tracing                     |

---

## 10. Step-by-Step Build Order

### Phase 1: Project Scaffolding (Day 1)

```
Step 1.1  Initialize Next.js 15 project with TypeScript and App Router
Step 1.2  Install and configure TailwindCSS 4
Step 1.3  Initialize shadcn/ui (components.json + first components)
Step 1.4  Set up project aliases in tsconfig.json (@/*)
Step 1.5  Configure ESLint + Prettier + .editorconfig
Step 1.6  Create .env.local and .env.example templates
Step 1.7  Set up Git repository with .gitignore
Step 1.8  Create root layout with Inter font + ThemeProvider
```

### Phase 2: Database & ORM (Day 1–2)

```
Step 2.1  Create Neon project and obtain connection string
Step 2.2  Install Drizzle ORM + drizzle-kit + @neondatabase/serverless
Step 2.3  Write drizzle.config.ts
Step 2.4  Define complete schema (schema.ts + relations.ts)
Step 2.5  Generate and apply initial migration
Step 2.6  Verify with drizzle-kit studio (visual database explorer)
```

### Phase 3: Authentication (Day 2–3)

```
Step 3.1  Install next-auth@beta (v5) + bcryptjs + @auth/drizzle-adapter
Step 3.2  Configure NextAuth.js (auth.config.ts, providers.ts)
Step 3.3  Create Drizzle adapter for NextAuth.js
Step 3.4  Build registration API route (POST /api/auth/register)
Step 3.5  Create auth middleware (middleware.ts)
Step 3.6  Build LoginForm + RegisterForm components
Step 3.7  Build auth layout with centered card design
Step 3.8  Add Google and GitHub OAuth providers
Step 3.9  Test full auth flow: register → login → session → logout
```

### Phase 4: Layout & Navigation (Day 3–4)

```
Step 4.1  Build dashboard layout (sidebar + topbar + content area)
Step 4.2  Build sidebar component with navigation links and icons
Step 4.3  Build topbar with user menu (avatar, dropdown, logout)
Step 4.4  Build mobile navigation (sheet/drawer)
Step 4.5  Implement dark/light theme toggle
Step 4.6  Add responsive breakpoint handling
```

### Phase 5: Task CRUD (Day 4–6)

```
Step 5.1  Create Zod validation schemas for tasks
Step 5.2  Build task API routes (GET list, POST create)
Step 5.3  Build task API routes (GET single, PATCH update, DELETE)
Step 5.4  Create React Query hooks (useTasks, useTask, useCreateTask, etc.)
Step 5.5  Build TaskForm component (create + edit modes)
Step 5.6  Build TaskCard component
Step 5.7  Build TaskList component with pagination
Step 5.8  Build TaskFilters component (status, search, date, sort)
Step 5.9  Build TaskDetail page
Step 5.10 Build TaskDeleteDialog with confirmation
Step 5.11 Add optimistic updates for status changes
```

### Phase 6: Sub-tasks (Day 6–7)

```
Step 6.1  Create Zod validation schemas for subtasks
Step 6.2  Build subtask API routes (CRUD)
Step 6.3  Create React Query hooks (useSubtasks, useToggleSubtask, etc.)
Step 6.4  Build SubtaskItem component (checkbox + inline edit)
Step 6.5  Build SubtaskList component (sortable checklist)
Step 6.6  Build SubtaskAddInput component (inline creation)
Step 6.7  Build TaskProgressBar (auto-calculated from subtask ratio)
Step 6.8  Implement optimistic updates for subtask toggles
Step 6.9  Wire auto-status updates (all done → completed, some → in_progress)
```

### Phase 7: Dashboard & Statistics (Day 7–8)

```
Step 7.1  Build stats API route (aggregated queries)
Step 7.2  Create useStats React Query hook
Step 7.3  Build StatsCards component (total, completed, in-progress, overdue)
Step 7.4  Build ProgressChart (bar chart, last 7 days)
Step 7.5  Build TaskDistribution (donut chart by status)
Step 7.6  Build RecentTasks (recent activity feed)
Step 7.7  Build OverdueAlert banner
Step 7.8  Add Suspense boundaries with skeleton loaders
```

### Phase 8: Polish & UX (Day 8–9)

```
Step 8.1  Add loading states (skeletons) to all pages
Step 8.2  Add empty states with illustrations and CTAs
Step 8.3  Add toast notifications (success/error feedback)
Step 8.4  Add micro-animations (Framer Motion for card transitions)
Step 8.5  Build custom 404 page
Step 8.6  Implement keyboard shortcuts (Ctrl+N for new task)
Step 8.7  Test and fix all responsive breakpoints
Step 8.8  Accessibility audit (keyboard nav, screen reader, focus traps)
```

### Phase 9: Security & Performance Hardening (Day 9–10)

```
Step 9.1  Configure security headers in next.config.ts
Step 9.2  Add rate limiting to auth + API routes
Step 9.3  Audit all API routes for proper authorization checks
Step 9.4  Run Lighthouse audit — target 95+ on all categories
Step 9.5  Add Vercel Analytics + Speed Insights
Step 9.6  Set up Sentry for error tracking (optional)
```

### Phase 10: Deployment (Day 10)

```
Step 10.1  Push to GitHub repository
Step 10.2  Connect repository to Vercel
Step 10.3  Configure environment variables in Vercel dashboard
Step 10.4  Deploy to production
Step 10.5  Configure custom domain (optional)
Step 10.6  Verify OAuth callbacks work on production domain
Step 10.7  Run production smoke tests
Step 10.8  Set up Dependabot for security updates
```

---

## 11. Future Features Roadmap

### Near-Term (Easy to Add)

| Feature                  | Effort | Notes                                                          |
| :----------------------- | :----- | :------------------------------------------------------------- |
| Due date notifications   | Low    | Cron job via Vercel CRON + email via Resend                    |
| Task labels/tags         | Low    | New `tags` table, many-to-many with tasks                      |
| Task priority levels     | Low    | Add `priority` enum column to `tasks` table                    |
| Drag & drop reordering   | Low    | `@dnd-kit/sortable` for task and subtask lists                 |
| Bulk actions             | Low    | Multi-select tasks → bulk delete, status change                |
| Export tasks (CSV/JSON)  | Low    | Server action to serialize and download                        |
| User avatar upload       | Medium | UploadThing or Cloudinary integration                          |

### Mid-Term (Moderate Effort)

| Feature                  | Effort | Notes                                                          |
| :----------------------- | :----- | :------------------------------------------------------------- |
| Task categories/projects | Medium | New `projects` table, tasks scoped under projects              |
| Recurring tasks          | Medium | RRULE-based recurrence, cron job to spawn instances            |
| Calendar view            | Medium | Full calendar component (FullCalendar or custom)               |
| Activity log / timeline  | Medium | Audit log table tracking all task mutations                    |
| Markdown descriptions    | Medium | Rich text editor (Tiptap) for task descriptions                |
| PWA support              | Medium | `next-pwa` for offline access, push notifications              |

### Long-Term (Significant Effort)

| Feature                    | Effort | Notes                                                        |
| :------------------------- | :----- | :----------------------------------------------------------- |
| Team workspaces            | High   | Multi-tenancy, invitations, role-based access                |
| Real-time collaboration    | High   | WebSocket via Pusher/Ably for live task updates              |
| AI task suggestions        | High   | OpenAI integration for smart task breakdowns                 |
| Mobile native app          | High   | React Native or Expo, sharing the API layer                  |
| Integrations               | High   | Zapier/webhooks, Google Calendar sync, Slack notifications   |
| Advanced analytics         | High   | Productivity trends, burndown charts, time tracking          |

---

## Environment Variables Template

```bash
# .env.example

# ─── Database ─────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# ─── NextAuth.js ──────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# ─── OAuth Providers ─────────────────────────────────────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ─── Rate Limiting (Upstash) ─────────────────────────────
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ─── Optional ────────────────────────────────────────────
SENTRY_DSN=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

> **This plan is implementation-ready.** Every file path, database column, API endpoint, and component exists in this document as a reference. Build each phase incrementally, test at every boundary, and deploy continuously.

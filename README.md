# TaskFlow

TaskFlow is a modern, enterprise-grade task management and productivity application designed to help individuals and teams organize their work effortlessly. With a focus on performance, reliability, and an exceptional user experience, TaskFlow bridges the gap between chaotic to-do lists and structured project execution.

## Key Features
- **Secure Authentication:** Integrated NextAuth.js for robust credential and OAuth management.
- **Real-Time Task Management:** Create, update, and track tasks with an intuitive dashboard.
- **Subtask Tracking:** Break down complex projects into granular subtasks. Progress bars automatically update task statuses dynamically based on subtask completion.
- **Optimistic UI:** Lightning-fast interaction with React Query optimistic updates for a seamless, lag-free experience.
- **Responsive Design:** A beautifully styled, mobile-first interface powered by Tailwind CSS v4 and dynamic CSS variables.
- **Serverless PostgreSQL:** Reliable and infinitely scalable data storage powered by Neon serverless Postgres.

## Tech Stack
TaskFlow is built on top of a highly modern and typesafe web stack:
- **Framework:** Next.js 16 (App Router, Server Actions)
- **Database:** Neon Serverless PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS v4
- **Data Fetching:** React Query (@tanstack/react-query)
- **Validation:** Zod

## Local Development / Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18.17 or newer recommended)
- `pnpm` package manager
- A local or remote PostgreSQL database (We recommend [Neon](https://neon.tech/))
- Auth secret tokens

### 1. Clone & Install
Clone the repository and install all dependencies using `pnpm`:
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file in the root of the project. You will need to provide the following variables:
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# NextAuth Configuration
# Run `npx auth secret` or `openssl rand -base64 32` to generate a secret
AUTH_SECRET="your_generated_auth_secret_here"
```

### 3. Database Schema Push
Push the Drizzle ORM schema to your Neon / PostgreSQL database:
```bash
pnpm db:push
```
*Note: This command uses `drizzle-kit push` to sync your database schema.*

### 4. Run the Development Server
Start the Next.js development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience TaskFlow.

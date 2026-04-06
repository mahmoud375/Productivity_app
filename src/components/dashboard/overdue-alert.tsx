"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";

interface OverdueAlertProps {
  count: number;
}

export function OverdueAlert({ count }: OverdueAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (count === 0 || dismissed) return null;

  return (
    <div className="relative flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {count} overdue {count === 1 ? "task" : "tasks"}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          You have tasks past their due date.{" "}
          <Link
            href="/tasks"
            className="underline underline-offset-2 font-medium hover:text-red-800 dark:hover:text-red-200"
          >
            View tasks →
          </Link>
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-md p-1 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shrink-0"
        aria-label="Dismiss overdue alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

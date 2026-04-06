"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Global keyboard shortcuts for TaskFlow.
 * - Ctrl/Cmd + K: Focus search bar in task filters
 * - Ctrl/Cmd + N: Navigate to new task page
 *
 * Mount this once in the dashboard layout.
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Ctrl/Cmd + K → Focus search input
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder="Search tasks..."]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Ctrl/Cmd + N → Navigate to new task
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/tasks/new");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}

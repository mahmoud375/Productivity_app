import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateRange(
  start?: Date | string | null,
  end?: Date | string | null
): string {
  if (!start && !end) return "No dates set";
  if (!end) return `From ${formatDate(start)}`;
  if (!start) return `Until ${formatDate(end)}`;
  return `${formatDate(start)} → ${formatDate(end)}`;
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(endDate: Date | string | null | undefined, status: string): boolean {
  if (!endDate || status === "completed") return false;
  return isPast(new Date(endDate)) && !isToday(new Date(endDate));
}

export function calculateProgress(
  total: number,
  completed: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

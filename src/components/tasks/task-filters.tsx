"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";

import type { TaskQueryInput } from "@/lib/validators/task.schema";

interface TaskFiltersProps {
  onFiltersChange: (filters: Partial<TaskQueryInput>) => void;
}

export function TaskFilters({ onFiltersChange }: TaskFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("created_at_desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // Parse sort key into sort + order
    type SortField = TaskQueryInput["sort"];
    type OrderField = TaskQueryInput["order"];
    type StatusField = TaskQueryInput["status"];

    let sort: SortField = "created_at";
    let order: OrderField = "desc";
    if (sortKey === "created_at_desc") {
      sort = "created_at";
      order = "desc";
    } else if (sortKey === "created_at_asc") {
      sort = "created_at";
      order = "asc";
    } else if (sortKey === "end_date_asc") {
      sort = "end_date";
      order = "asc";
    } else if (sortKey === "title_asc") {
      sort = "title";
      order = "asc";
    }

    const statusValue: StatusField =
      status === "all" ? undefined : (status as StatusField);

    onFiltersChange({
      search: debouncedSearch || undefined,
      status: statusValue,
      sort,
      order,
      filterStartDate: startDate || undefined,
      filterEndDate: endDate || undefined,
    });
  }, [debouncedSearch, status, sortKey, startDate, endDate, onFiltersChange]);

  const hasFilters = search || status !== "all" || startDate || endDate;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v ?? "created_at_desc")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Newest first</SelectItem>
            <SelectItem value="created_at_asc">Oldest first</SelectItem>
            <SelectItem value="end_date_asc">Due date</SelectItem>
            <SelectItem value="title_asc">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setStartDate("");
              setEndDate("");
            }}
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <label htmlFor="filter-start-date" className="text-sm text-muted-foreground whitespace-nowrap">
            From
          </label>
          <Input
            id="filter-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <label htmlFor="filter-end-date" className="text-sm text-muted-foreground whitespace-nowrap">
            To
          </label>
          <Input
            id="filter-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, Trash2, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Subtask } from "@/types/task";

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (id: string, isCompleted: boolean) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function SubtaskItem({
  subtask,
  onToggle,
  onUpdate,
  onDelete,
  disabled,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(subtask.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== subtask.title) {
      onUpdate(subtask.id, trimmed);
    } else {
      setEditValue(subtask.title);
    }
    setIsEditing(false);
  }

  function handleCancel() {
    setEditValue(subtask.title);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors",
        subtask.isCompleted
          ? "bg-muted/40 border-border/50"
          : "bg-card hover:bg-accent/50"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:block" />

      <Checkbox
        checked={subtask.isCompleted}
        onCheckedChange={(checked) =>
          onToggle(subtask.id, checked === true)
        }
        disabled={disabled}
        aria-label={`Mark "${subtask.title}" as ${subtask.isCompleted ? "incomplete" : "complete"}`}
      />

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-8 text-sm flex-1"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleSave}
            aria-label="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCancel}
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <span
          className={cn(
            "flex-1 text-sm cursor-pointer select-none truncate min-w-0",
            subtask.isCompleted && "line-through text-muted-foreground"
          )}
          onDoubleClick={() => !disabled && setIsEditing(true)}
          title="Double-click to edit"
        >
          {subtask.title}
        </span>
      )}

      {!isEditing && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(subtask.id)}
          disabled={disabled}
          aria-label={`Delete "${subtask.title}"`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

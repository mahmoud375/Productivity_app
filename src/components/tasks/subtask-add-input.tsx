"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SubtaskAddInputProps {
  onAdd: (title: string) => void;
  isPending?: boolean;
}

export function SubtaskAddInput({ onAdd, isPending }: SubtaskAddInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a subtask..."
        className="flex-1 text-sm"
        disabled={isPending}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={!value.trim() || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-1" />
        )}
        Add
      </Button>
    </form>
  );
}

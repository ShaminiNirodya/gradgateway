"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AdminViewMode = "list" | "grid";

export function AdminViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: AdminViewMode;
  onChange: (mode: AdminViewMode) => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        className="rounded-xl"
        onClick={() => onChange("list")}
      >
        <List className="mr-1 h-4 w-4" />
        List
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        className="rounded-xl"
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="mr-1 h-4 w-4" />
        Grid
      </Button>
    </div>
  );
}

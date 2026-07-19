"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { filterSkills, getSkillCatalogCount } from "@/lib/constants/tech-skills";

export type ReadonlySkillTag = {
  name: string;
  title?: string;
};

type SkillsPickerProps = {
  /** Selected skill names (editable tags or checkbox selections). */
  selected: Set<string>;
  onToggle: (skill: string) => void;
  onRemove?: (skill: string) => void;
  /** Read-only tags shown alongside selected skills (e.g. from projects). */
  readonlyTags?: ReadonlySkillTag[];
  label?: string;
  required?: boolean;
  showLabel?: boolean;
  placeholder?: string;
  triggerClassName?: string;
  /** `field` = form dropdown with checkboxes; `tags` = inline badges + add button. */
  variant?: "field" | "tags";
  addButtonLabel?: string;
  addButtonClassName?: string;
  emptyMessage?: string;
  tagsContainerClassName?: string;
  menuAlign?: "start" | "center" | "end";
  menuWidthClassName?: string;
  headerExtra?: ReactNode;
  /** Left side content in tags mode (e.g. section title). Add button stays on the right. */
  toolbar?: ReactNode;
  toolbarClassName?: string;
  className?: string;
};

function SkillSearchInput({
  value,
  onChange,
  placeholder = "Search React, Python, AWS...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-9 rounded-lg border-slate-200 pl-9"
        />
      </div>
    </div>
  );
}

export function SkillsPicker({
  selected,
  onToggle,
  onRemove,
  readonlyTags = [],
  label = "Skills",
  required = false,
  showLabel = true,
  placeholder = "Search 1,000+ technologies...",
  triggerClassName,
  variant = "field",
  addButtonLabel = "Add Skill",
  addButtonClassName,
  emptyMessage = "No skills selected yet.",
  tagsContainerClassName,
  menuAlign = "start",
  menuWidthClassName,
  headerExtra,
  toolbar,
  toolbarClassName,
  className,
}: SkillsPickerProps) {
  const [skillSearch, setSkillSearch] = useState("");
  const [open, setOpen] = useState(false);

  const blockedNames = useMemo(() => {
    const names = new Set<string>();
    selected.forEach((name) => names.add(name.toLowerCase()));
    readonlyTags.forEach((tag) => names.add(tag.name.toLowerCase()));
    return names;
  }, [selected, readonlyTags]);

  const catalogCount = getSkillCatalogCount();
  const isBrowseMode = !skillSearch.trim();

  const filteredSkills = useMemo(() => {
    const results = filterSkills(skillSearch);
    if (variant === "field") return results;
    return results.filter((skill) => !blockedNames.has(skill.name.toLowerCase()));
  }, [skillSearch, blockedNames, variant]);

  const hasBlockedMatches = useMemo(() => {
    if (!skillSearch.trim() || filteredSkills.length > 0) return false;
    return filterSkills(skillSearch).some((skill) =>
      blockedNames.has(skill.name.toLowerCase())
    );
  }, [skillSearch, filteredSkills.length, blockedNames]);

  const handleRemove = (skill: string) => {
    if (onRemove) onRemove(skill);
    else onToggle(skill);
  };

  const handlePick = (skill: string) => {
    if (variant === "tags") {
      if (!selected.has(skill)) onToggle(skill);
      setSkillSearch("");
      return;
    }
    onToggle(skill);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSkillSearch("");
  };

  const menuContent = (
    <>
      <SkillSearchInput value={skillSearch} onChange={setSkillSearch} placeholder={placeholder} />
      <div
        className="max-h-72 overflow-y-auto overscroll-contain p-2"
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredSkills.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-slate-500">
            {skillSearch.trim()
              ? hasBlockedMatches
                ? "Matching skills are already added"
                : `No skills match "${skillSearch}"`
              : "Type to search technologies"}
          </p>
        ) : variant === "field" ? (
          filteredSkills.map((skill) => (
            <label
              key={skill.name}
              className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm hover:bg-indigo-50"
            >
              <Checkbox
                checked={selected.has(skill.name)}
                onCheckedChange={() => onToggle(skill.name)}
              />
              <span className="min-w-0 flex-1 truncate text-slate-700">{skill.name}</span>
              {skill.category ? (
                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {skill.category}
                </span>
              ) : null}
            </label>
          ))
        ) : (
          filteredSkills.map((skill) => (
            <DropdownMenuItem
              key={skill.name}
              onClick={() => handlePick(skill.name)}
              className="cursor-pointer rounded-lg font-medium text-slate-600 focus:bg-indigo-50 focus:text-[#6C5DD3]"
            >
              <span className="min-w-0 flex-1 truncate">{skill.name}</span>
              {skill.category ? (
                <span className="ml-2 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {skill.category}
                </span>
              ) : null}
            </DropdownMenuItem>
          ))
        )}
        {!isBrowseMode && filteredSkills.length > 0 ? (
          <p className="px-2 pt-2 text-center text-xs text-slate-400">
            {filteredSkills.length} result{filteredSkills.length === 1 ? "" : "s"} — refine your search for more
          </p>
        ) : null}
      </div>
    </>
  );

  if (variant === "tags") {
    const hasTags = selected.size > 0 || readonlyTags.length > 0;

    return (
      <div className={cn("space-y-3", className)}>
        {(showLabel || headerExtra || toolbar) && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3",
              toolbarClassName
            )}
          >
            <div className="min-w-0">
              {toolbar}
              {showLabel ? (
                <Label className="mb-0">
                  {label}
                  {required ? " *" : ""}
                </Label>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {headerExtra}
              <DropdownMenu open={open} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      "rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]",
                      addButtonClassName
                    )}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {addButtonLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={menuAlign}
                  className={cn(
                    "rounded-xl border-slate-200/80 bg-white p-0 shadow-xl",
                    menuWidthClassName ?? "min-w-[280px]"
                  )}
                >
                  {menuContent}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {!showLabel && !headerExtra && !toolbar && (
          <div className="flex justify-end">
            <DropdownMenu open={open} onOpenChange={handleOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 rounded-lg border-[#6C5DD3] text-[#6C5DD3] hover:bg-[#6C5DD3] hover:text-white",
                    addButtonClassName
                  )}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {addButtonLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={menuAlign}
                className={cn(
                  "rounded-xl border-slate-200/80 bg-white p-0 shadow-xl",
                  menuWidthClassName ?? "min-w-[280px]"
                )}
              >
                {menuContent}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div
          className={cn(
            "flex min-h-[60px] flex-wrap gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4",
            tagsContainerClassName
          )}
        >
          {Array.from(selected).map((skill) => (
            <div key={skill} className="group relative">
              <Badge className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-violet-100 hover:bg-violet-50/50">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer text-slate-400 opacity-70 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  onClick={() => handleRemove(skill)}
                />
              </Badge>
            </div>
          ))}
          {readonlyTags.map((tag) => (
            <Badge
              key={`readonly-${tag.name}`}
              title={tag.title}
              className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm"
            >
              {tag.name}
            </Badge>
          ))}
          {!hasTags && (
            <p className="text-sm italic text-slate-400">{emptyMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(showLabel || selected.size > 0) && (
        <div className="flex items-center justify-between gap-2">
          {showLabel ? (
            <Label className="mb-0">
              {label}
              {required ? " *" : ""}
            </Label>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                {selected.size} selected
              </span>
            )}
            {showLabel ? (
              <span className="hidden text-xs text-slate-400 sm:inline">
                {getSkillCatalogCount()}+ in catalog
              </span>
            ) : null}
          </div>
        </div>
      )}

      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-auto min-h-11 w-full justify-between gap-2 rounded-xl border-slate-200/80 py-2 pl-3 pr-2 text-left font-normal shadow-sm hover:bg-slate-50",
              selected.size > 0 && "items-start",
              triggerClassName
            )}
          >
            {selected.size === 0 ? (
              <span className="text-slate-500">{placeholder}</span>
            ) : (
              <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {Array.from(selected).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex max-w-full items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    <span className="truncate">{skill}</span>
                    <span
                      className="shrink-0 cursor-pointer rounded-sm hover:bg-indigo-100"
                      aria-label={`Remove ${skill}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(skill);
                      }}
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </span>
                  </span>
                ))}
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={menuAlign}
          className={cn(
            "w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200/80 bg-white p-0 shadow-xl",
            menuWidthClassName
          )}
        >
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

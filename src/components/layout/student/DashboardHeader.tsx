"use client";

import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStudentProfile } from "@/lib/hooks/useStudentProfile";
export default function DashboardHeader() {
  const { profile, initials } = useStudentProfile();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="max-w-lg flex-1">
        <div className="group relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-600" />
          <Input
            placeholder="Search projects, skills..."
            className="h-9 border-slate-200 bg-slate-50/50 pl-9 text-sm transition-all focus:border-violet-200 focus:bg-white focus:ring-2 focus:ring-violet-50"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-sans text-[10px] font-medium text-slate-500 opacity-100 sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button size="sm" className="hidden h-9 gap-2 bg-slate-900 text-white hover:bg-slate-800 sm:flex">
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </Button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Avatar className="h-8 w-8 cursor-pointer border border-slate-200 transition-all hover:ring-2 hover:ring-slate-100">
          <AvatarImage src={profile?.photoDataUrl} />
          <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-700">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

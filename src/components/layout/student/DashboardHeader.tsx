import { Bell, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function DashboardHeader() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Global Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
          <Input 
            placeholder="Search projects, skills..." 
            className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-violet-200 focus:ring-2 focus:ring-violet-50 transition-all h-9 text-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                <span className="text-xs">⌘</span>K
             </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Button size="sm" className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white gap-2 h-9">
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
        </Button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Button>

        <Avatar className="h-8 w-8 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-slate-100 transition-all">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="bg-slate-100 text-slate-700 font-medium text-xs">KP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

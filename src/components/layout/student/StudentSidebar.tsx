"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  MessageSquare,
  Settings,
  LogOut,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", href: "/student", icon: LayoutGrid },
  { name: "My Projects", href: "/student/projects", icon: Folder },
  { name: "Messages", href: "/student/messages", icon: MessageSquare },
  { name: "Discover", href: "/student/discover", icon: Compass },
  { name: "Settings", href: "/student/settings", icon: Settings },
];

const network = [
  { name: "Sarah J.", img: "https://i.pravatar.cc/150?u=1", role: "Recruiter" },
  { name: "Mike T.", img: "https://i.pravatar.cc/150?u=2", role: "Developer" },
  { name: "Anna W.", img: "https://i.pravatar.cc/150?u=3", role: "Mentor" },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white w-72 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-[#6C5DD3] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Compass className="w-6 h-6" />
        </div>
        <span className="font-bold text-2xl text-slate-800 tracking-tight">GradGt.</span>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overview</p>
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300",
                    isActive
                      ? "bg-[#6C5DD3] text-white shadow-lg shadow-indigo-200"
                      : "text-slate-500 hover:text-[#6C5DD3] hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Network</p>
          <div className="space-y-4 px-4">
            {network.map((person) => (
              <div key={person.name} className="flex items-center gap-3 cursor-pointer group">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarImage src={person.img} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-[#6C5DD3] transition-colors">{person.name}</p>
                  <p className="text-xs text-slate-400">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors mt-6 font-semibold">
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}

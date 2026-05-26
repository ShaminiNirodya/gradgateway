"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Users2,
  FilePlus2,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import type { ApplicationItem } from "@/lib/types/dashboard";

const navItems = [
  { name: "Dashboard", href: "/dashboard/company", icon: LayoutGrid },
  { name: "Talent Search", href: "/dashboard/company/talent", icon: Users2 },
  { name: "Applications", href: "/dashboard/company/applications", icon: FilePlus2 },
  { name: "Job Posts", href: "/dashboard/company/jobs", icon: FilePlus2 },
  { name: "Messages", href: "/dashboard/company/messages", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/company/settings", icon: Settings },
];

export default function CompanySidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [recentCandidates, setRecentCandidates] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const loadRecentCandidates = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setRecentCandidates([]);
          return;
        }

        const apps = await DashboardService.getCompanyApplications(token);
        const latest = [...apps]
          .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
          .slice(0, 3);

        setRecentCandidates(latest);
      } catch {
        setRecentCandidates([]);
      }
    };

    loadRecentCandidates();
  }, []);

  const candidateItems = useMemo(() => recentCandidates, [recentCandidates]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-72 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
          <img src="/logo.svg" alt="GradGateway Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-extrabold text-2xl text-slate-800 tracking-tight">GradGateway<span className="text-slate-400 font-bold text-sm ml-1">Recruit</span></span>
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
                    "flex items-center gap-4 px-4 py-3.5 rounded-[24px] text-sm font-bold transition-all duration-300",
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
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Candidates</p>
          <div className="space-y-4 px-4">
            {candidateItems.map((person) => (
              <div key={person.id} className="flex items-center gap-3 cursor-pointer group">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarFallback>{person.studentName?.[0] || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-[#6C5DD3] transition-colors">{person.studentName}</p>
                  <p className="text-xs text-slate-400">{person.jobTitle}</p>
                </div>
              </div>
            ))}
            {candidateItems.length === 0 && (
              <p className="text-xs text-slate-400">No candidates yet.</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors mt-6 font-semibold"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Logout</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">Are you sure you want to log out of your recruitment account?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

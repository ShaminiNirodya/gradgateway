"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Users2,
  ClipboardList,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUnreadConversations } from "@/components/shared/UnreadConversationsProvider";
import { UnreadMessageIndicator } from "@/components/shared/UnreadMessageIndicator";
const navItems = [
  { name: "Dashboard", href: "/dashboard/company", icon: LayoutGrid },
  { name: "Talent Search", href: "/dashboard/company/talent", icon: Users2 },
  { name: "Applications", href: "/dashboard/company/applications", icon: ClipboardList },
  { name: "Job Posts", href: "/dashboard/company/jobs", icon: Briefcase },
  { name: "Messages", href: "/dashboard/company/messages", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/company/settings", icon: Settings },
];

export default function CompanySidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showMessagesBadge } = useUnreadConversations();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-full w-72 flex-col overflow-x-visible overflow-y-auto border-r border-slate-200/80 bg-white p-6">
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          <img src="/logo.svg" alt="GradGateway Logo" className="h-full w-full object-contain" />
        </div>
        <span className="min-w-0 font-extrabold text-2xl tracking-tight text-slate-800">
          GradGateway
          <span className="ml-1 text-sm font-bold text-slate-400">Recruit</span>
        </span>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overview</p>
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const showBadge = item.name === "Messages" && showMessagesBadge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-[#6C5DD3] text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#6C5DD3]"
                  )}
                >
                  <span className="relative inline-flex shrink-0">
                    <item.icon className="w-5 h-5" />
                    {showBadge && (
                      <UnreadMessageIndicator
                        className="absolute -top-1 -right-1"
                        ringClassName={isActive ? "ring-[#6C5DD3]" : "ring-white"}
                      />
                    )}
                  </span>
                  {item.name}
                </Link>
              );
            })}
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
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-in zoom-in-95 fade-in duration-300">
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

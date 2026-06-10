"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
  Briefcase,
  Compass,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUnreadConversations } from "@/components/shared/UnreadConversationsProvider";
import { UnreadMessageIndicator } from "@/components/shared/UnreadMessageIndicator";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
const navItems = [
  { name: "Dashboard", href: "/dashboard/student", icon: LayoutGrid },
  { name: "My Projects", href: "/dashboard/student/projects", icon: Folder },
  { name: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
  { name: "Openings", href: "/dashboard/student/openings", icon: Compass },
  { name: "Applications", href: "/dashboard/student/applications", icon: Briefcase },
  { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
];

export default function StudentSidebar() {
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
    <div className="flex flex-col h-full bg-white w-72 p-6 overflow-y-auto">
      <div className="mb-12 px-2">
        <GradGatewayLogo href="/dashboard/student" size={40} wordmarkClassName="text-2xl text-slate-800" />
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
                    "relative flex items-center gap-4 px-4 py-3.5 rounded-[24px] text-sm font-bold transition-all duration-300",
                    isActive
                      ? "bg-[#6C5DD3] text-white shadow-lg shadow-indigo-200"
                      : "text-slate-500 hover:text-[#6C5DD3] hover:bg-slate-50"
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

      <div className="mx-2 mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#6C5DD3] shadow-sm">
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Need Help?</h4>
            <p className="text-[11px] font-medium text-slate-500">Contact support team</p>
          </div>
        </div>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="h-9 w-full rounded-xl bg-white text-[#6C5DD3] shadow-sm hover:bg-white/90"
        >
          <Link href="/help">Get Support</Link>
        </Button>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="mt-4 flex items-center gap-3 px-4 py-3 font-semibold text-slate-400 transition-colors hover:text-red-500"
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
            <p className="text-slate-500 text-center mb-8 font-medium">Are you sure you want to log out of your account?</p>
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

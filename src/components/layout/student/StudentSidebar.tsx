"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  MessageSquare,
  Settings,
  LogOut,
  Briefcase,
  Compass,
  LifeBuoy,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUnreadConversations } from "@/components/shared/UnreadConversationsProvider";
import { UnreadMessageIndicator } from "@/components/shared/UnreadMessageIndicator";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
import { darkSidebar } from "@/components/layout/sidebar-dark-theme";

const navItems = [
  { name: "Dashboard", href: "/dashboard/student", icon: LayoutGrid },
  { name: "My Projects", href: "/dashboard/student/projects", icon: Folder },
  { name: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
  { name: "Openings", href: "/dashboard/student/openings", icon: Compass },
  { name: "Applications", href: "/dashboard/student/applications", icon: Briefcase },
  { name: "Interviews", href: "/dashboard/student/interviews", icon: CalendarDays },
  { name: "Analytics", href: "/dashboard/student/analytics", icon: BarChart3 },
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
    <div className={darkSidebar.shell}>
      <div className="mb-12 px-2">
        <GradGatewayLogo
          href="/dashboard/student"
          size={40}
          wordmarkClassName={darkSidebar.wordmark}
        />
      </div>

      <div className="flex-1 space-y-8">
        <div>
          <p className={darkSidebar.sectionLabel}>Overview</p>
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const showBadge = item.name === "Messages" && showMessagesBadge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-4 rounded-[24px] px-4 py-3.5 text-sm font-bold transition-all duration-300",
                    isActive ? darkSidebar.navActive : darkSidebar.navInactive
                  )}
                >
                  <span className="relative inline-flex shrink-0">
                    <item.icon className="h-5 w-5" />
                    {showBadge && (
                      <UnreadMessageIndicator
                        className="absolute -right-1 -top-1"
                        ringClassName={
                          isActive ? darkSidebar.badgeRingActive : darkSidebar.badgeRing
                        }
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

      <div className={darkSidebar.helpCard}>
        <div className="mb-3 flex items-center gap-2">
          <div className={darkSidebar.helpIcon}>
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div>
            <h4 className={darkSidebar.helpTitle}>Need Help?</h4>
            <p className={darkSidebar.helpSubtitle}>Contact support team</p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm" className={darkSidebar.helpButton}>
          <Link href="/dashboard/student/help#support">Get Support</Link>
        </Button>
      </div>

      <button type="button" onClick={() => setShowLogoutConfirm(true)} className={cn(darkSidebar.logout, "mt-4")}>
        <LogOut className="h-5 w-5" />
        Log Out
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-in bg-slate-900/40 backdrop-blur-sm fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm animate-in rounded-[32px] bg-white p-8 shadow-2xl zoom-in-95 fade-in duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <LogOut className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="mb-2 text-center text-xl font-bold text-slate-800">Logout</h3>
            <p className="mb-8 text-center font-medium text-slate-500">
              Are you sure you want to log out of your account?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

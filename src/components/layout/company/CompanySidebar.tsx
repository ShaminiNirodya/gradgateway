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
  LifeBuoy,
  BarChart3,
  MessageSquareQuote,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUnreadConversations } from "@/components/shared/UnreadConversationsProvider";
import { UnreadMessageIndicator } from "@/components/shared/UnreadMessageIndicator";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
import { darkSidebar } from "@/components/layout/sidebar-dark-theme";

const navItems = [
  { name: "Dashboard", href: "/dashboard/company", icon: LayoutGrid },
  { name: "Talent Search", href: "/dashboard/company/talent", icon: Users2 },
  { name: "Applications", href: "/dashboard/company/applications", icon: ClipboardList },
  { name: "Job Posts", href: "/dashboard/company/jobs", icon: Briefcase },
  { name: "Messages", href: "/dashboard/company/messages", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/company/analytics", icon: BarChart3 },
  { name: "Share experience", href: "/dashboard/company/share-experience", icon: MessageSquareQuote },
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
    <div className={cn(darkSidebar.shell, "overflow-x-visible")}>
      <div className="mb-12 flex items-center gap-3 px-2">
        <GradGatewayLogo href="/dashboard/company" size={40} showWordmark={false} />
        <span className="min-w-0 font-extrabold text-2xl tracking-tight text-white">
          GradGateway
          <span className={cn("ml-1", darkSidebar.wordmarkAccent)}>Recruit</span>
        </span>
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
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
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
          <Link href="/dashboard/company/help#support">Get Support</Link>
        </Button>
      </div>

      <button type="button" onClick={() => setShowLogoutConfirm(true)} className={cn(darkSidebar.logout, "mt-6")}>
        <LogOut className="h-5 w-5" />
        Log Out
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-in bg-slate-900/40 backdrop-blur-sm fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm animate-in rounded-2xl border border-slate-200 bg-white p-8 shadow-xl zoom-in-95 fade-in duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <LogOut className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="mb-2 text-center text-xl font-bold text-slate-800">Logout</h3>
            <p className="mb-8 text-center font-medium text-slate-500">
              Are you sure you want to log out of your recruitment account?
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

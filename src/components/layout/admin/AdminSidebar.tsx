"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  GraduationCap,
  Building2,
  LogOut,
  MessageSquare,
  MessagesSquare,
  MailCheck,
  Quote,
  BarChart3,
  BookOpen,
  Settings,
  School,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { darkSidebar } from "@/components/layout/sidebar-dark-theme";

const navItems = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutGrid, badgeKey: null as null | "inquiries" | "testimonials" },
  { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3, badgeKey: null },
  { name: "Inquiries", href: "/dashboard/admin/inquiries", icon: MessageSquare, badgeKey: "inquiries" as const },
  { name: "Messages", href: "/dashboard/admin/messages", icon: MessagesSquare, badgeKey: null },
  { name: "Testimonials", href: "/dashboard/admin/testimonials", icon: Quote, badgeKey: "testimonials" as const },
  { name: "Site content", href: "/dashboard/admin/content", icon: BookOpen, badgeKey: null },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Settings, badgeKey: null },
  { name: "Students", href: "/dashboard/admin/students", icon: GraduationCap, badgeKey: null },
  { name: "Companies", href: "/dashboard/admin/companies", icon: Building2, badgeKey: null },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { data, newTestimonialsCount } = useAdminDashboard();
  const openInquiries = data?.openSupportInquiries ?? 0;

  const getBadgeCount = (badgeKey: (typeof navItems)[number]["badgeKey"]) => {
    if (badgeKey === "inquiries") return openInquiries;
    if (badgeKey === "testimonials") return newTestimonialsCount;
    return 0;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login/admin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={darkSidebar.shell}>
      <div className="mb-12 flex items-center gap-3 px-2">
        <GradGatewayLogo href="/dashboard/admin" size={40} showWordmark={false} />
        <span className="min-w-0 font-extrabold text-2xl tracking-tight text-white">
          GradGateway
          <span className={cn("ml-1", darkSidebar.wordmarkAccent)}>Admin</span>
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                isActive ? darkSidebar.navActive : darkSidebar.navInactive
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badgeKey && getBadgeCount(item.badgeKey) > 0 && (
                <span
                  className={cn(
                    "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : darkSidebar.inquiryBadge
                  )}
                >
                  {getBadgeCount(item.badgeKey)}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <button type="button" onClick={() => setShowLogoutConfirm(true)} className={cn(darkSidebar.logout, "mt-6")}>
        <LogOut className="h-5 w-5" />
        Log Out
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Log out?</h3>
            <p className="mt-2 text-sm text-slate-500">
              You will need to sign in again to access the admin panel.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl bg-red-600 hover:bg-red-700" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

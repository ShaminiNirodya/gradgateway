"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Users,
  Building2,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";

const navItems = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutGrid, badgeKey: null as null | "inquiries" },
  { name: "Inquiries", href: "/dashboard/admin/inquiries", icon: MessageSquare, badgeKey: "inquiries" as const },
  { name: "Users", href: "/dashboard/admin/users", icon: Users, badgeKey: null },
  { name: "Companies", href: "/dashboard/admin/companies", icon: Building2, badgeKey: null },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Settings, badgeKey: null },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { data } = useAdminDashboard();
  const openInquiries = data?.openSupportInquiries ?? 0;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login/admin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-full w-72 flex-col overflow-y-auto border-r border-slate-200/80 bg-white p-6">
      <div className="mb-12 flex items-center gap-3 px-2">
        <GradGatewayLogo href="/dashboard/admin" size={40} showWordmark={false} />
        <span className="min-w-0 font-extrabold text-2xl tracking-tight text-slate-800">
          GradGateway
          <span className="ml-1 text-sm font-bold text-slate-400">Admin</span>
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
                isActive
                  ? "bg-[#6C5DD3] text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#6C5DD3]"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badgeKey === "inquiries" && openInquiries > 0 && (
                <span
                  className={cn(
                    "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                  )}
                >
                  {openInquiries}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="mt-6 flex items-center gap-3 px-4 py-3 font-semibold text-slate-400 transition-colors hover:text-red-500"
      >
        <LogOut className="h-5 w-5" />
        Log Out
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Log out?</h3>
            <p className="mt-2 text-sm text-slate-500">You will need to sign in again to access the admin panel.</p>
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

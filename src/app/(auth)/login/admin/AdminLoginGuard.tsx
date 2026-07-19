"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

export function AdminLoginGuard({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userData?.role === "Admin") {
      router.replace("/dashboard/admin");
    }
  }, [loading, user, userData, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  if (user && userData?.role === "Admin") {
    return null;
  }

  return <>{children}</>;
}

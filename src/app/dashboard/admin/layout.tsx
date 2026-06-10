import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { AdminDashboardProvider } from "@/components/features/admin/AdminDashboardProvider";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Admin"]} redirectTo="/login/admin">
      <AdminDashboardProvider>
        <div className="flex h-screen overflow-hidden bg-[#F5F7FB]">
          <div className="hidden flex-none md:block">
            <AdminSidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </AdminDashboardProvider>
    </ProtectedRoute>
  );
}

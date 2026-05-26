import ProtectedRoute from "@/components/features/auth/ProtectedRoute";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute allowedRoles={["Admin"]}>{children}</ProtectedRoute>;
}

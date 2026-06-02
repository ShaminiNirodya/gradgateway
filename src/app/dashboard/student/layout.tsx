import StudentSidebar from "@/components/layout/student/StudentSidebar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { UnreadConversationsProvider } from "@/components/shared/UnreadConversationsProvider";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <UnreadConversationsProvider>
        <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
          <div className="flex-none hidden md:block">
            <StudentSidebar />
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
        </div>
      </UnreadConversationsProvider>
    </ProtectedRoute>
  );
}

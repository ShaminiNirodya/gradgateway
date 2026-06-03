import StudentSidebar from "@/components/layout/student/StudentSidebar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { UnreadConversationsProvider } from "@/components/shared/UnreadConversationsProvider";
import { NotificationsProvider } from "@/components/shared/NotificationsProvider";
import { SignalRConnectionProvider } from "@/components/shared/SignalRConnectionProvider";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <SignalRConnectionProvider>
      <NotificationsProvider>
        <UnreadConversationsProvider>
          <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
            <div className="hidden flex-none md:block">
              <StudentSidebar />
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
          </div>
        </UnreadConversationsProvider>
      </NotificationsProvider>
      </SignalRConnectionProvider>
    </ProtectedRoute>
  );
}

import StudentSidebar from "@/components/layout/student/StudentSidebar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { AccountBlockedGate } from "@/components/features/auth/AccountBlockedGate";
import { UnreadConversationsProvider } from "@/components/shared/UnreadConversationsProvider";
import { NotificationsProvider } from "@/components/shared/NotificationsProvider";
import { SignalRConnectionProvider } from "@/components/shared/SignalRConnectionProvider";
import { MaintenanceGate } from "@/components/shared/PlatformGates";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaintenanceGate>
    <ProtectedRoute allowedRoles={["Student"]}>
      <SignalRConnectionProvider>
      <NotificationsProvider>
        <UnreadConversationsProvider>
          <AccountBlockedGate>
            <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
              <div className="hidden flex-none md:block">
                <StudentSidebar />
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 lg:p-8">
                <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              </div>
            </div>
          </AccountBlockedGate>
        </UnreadConversationsProvider>
      </NotificationsProvider>
      </SignalRConnectionProvider>
    </ProtectedRoute>
    </MaintenanceGate>
  );
}

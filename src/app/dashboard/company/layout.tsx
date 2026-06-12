import CompanySidebar from "@/components/layout/company/CompanySidebar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { AccountBlockedGate } from "@/components/features/auth/AccountBlockedGate";
import { UnreadConversationsProvider } from "@/components/shared/UnreadConversationsProvider";
import { NotificationsProvider } from "@/components/shared/NotificationsProvider";
import { SignalRConnectionProvider } from "@/components/shared/SignalRConnectionProvider";
import { MaintenanceGate } from "@/components/shared/PlatformGates";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaintenanceGate>
    <ProtectedRoute allowedRoles={["Company"]}>
      <SignalRConnectionProvider>
      <NotificationsProvider>
        <UnreadConversationsProvider>
          <AccountBlockedGate>
            <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
              <div className="flex-none hidden md:block">
                <CompanySidebar />
              </div>

              <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 lg:p-8">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
                  {children}
                </div>
              </main>
            </div>
          </AccountBlockedGate>
        </UnreadConversationsProvider>
      </NotificationsProvider>
      </SignalRConnectionProvider>
    </ProtectedRoute>
    </MaintenanceGate>
  );
}

import CompanySidebar from "@/components/layout/company/CompanySidebar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { UnreadConversationsProvider } from "@/components/shared/UnreadConversationsProvider";
import { NotificationsProvider } from "@/components/shared/NotificationsProvider";
import { SignalRConnectionProvider } from "@/components/shared/SignalRConnectionProvider";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Company"]}>
      <SignalRConnectionProvider>
      <NotificationsProvider>
        <UnreadConversationsProvider>
        <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
          <div className="flex-none hidden md:block">
            <CompanySidebar />
          </div>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        </UnreadConversationsProvider>
      </NotificationsProvider>
      </SignalRConnectionProvider>
    </ProtectedRoute>
  );
}

import StudentSidebar from "@/components/layout/student/StudentSidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
      <div className="flex-none hidden md:block">
        <StudentSidebar />
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
    </div>
  );
}

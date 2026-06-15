import { Suspense } from "react";
import { AdminMessagesPanel } from "@/components/features/admin/AdminMessagesPanel";

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading messages…</p>}>
      <AdminMessagesPanel />
    </Suspense>
  );
}

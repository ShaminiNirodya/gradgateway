import { Suspense } from "react";

export default function AdminCompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="p-8 text-slate-500">Loading…</div>}>{children}</Suspense>;
}

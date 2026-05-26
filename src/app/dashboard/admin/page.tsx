"use client";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3, Download } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminDashboardPage() {
  const { show } = useToast();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Pending Verifications", value: 23 },
            { label: "Active Users", value: 9567 },
            { label: "Projects This Month", value: 456 },
            { label: "Reports", value: 5 },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-[18px] p-4 shadow-sm">
              <p className="text-xs text-slate-400">{k.label}</p>
              <h3 className="text-xl font-bold text-slate-800">{k.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Pending Actions" items={["User Verification","Report Review","Company Verification","Content Moderation"]} />
          <Card title="Recent Activity" items={["Approved user verification","Rejected company application","Reviewed project report","Updated system settings","Banned user account"]} />
        </div>

        <div className="bg-white rounded-[18px] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">System Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Server Status", value: "Operational" },
              { label: "Database", value: "Available" },
              { label: "API Response", value: "45ms avg" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs text-slate-400">{s.label}</p>
                <h5 className="text-sm font-bold text-slate-800">{s.value}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="bg-white rounded-[18px] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Control Center</h3>
          <div className="space-y-2">
            {["User Verification","Company Verification","Project Moderation","Reports","Analytics","Settings"].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{i}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => show({ title: `Opening ${i}`, description: "Feature coming soon", variant: "success" })}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[18px] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Quick Reports</h3>
          <div className="flex items-center gap-2">
            <Button
              className="rounded-xl flex-1"
              onClick={() => {
                const data = {
                  week: "2026-01-19..2026-01-25",
                  pendingVerifications: 23,
                  activeUsers: 9567,
                  projects: 456,
                  reports: 5,
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "weekly-report.json";
                a.click();
                URL.revokeObjectURL(url);
                show({ title: "Report generated", description: "Weekly report downloaded", variant: "success" });
              }}
            >
              <BarChart3 className="w-4 h-4 mr-2" /> Generate Weekly Report
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => show({ title: "Exported", description: "KPIs saved as CSV", variant: "success" })}>Export KPIs (CSV)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => show({ title: "Exported", description: "Dashboard saved as JSON", variant: "success" })}>Export Dashboard (JSON)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-[18px] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i} className="rounded-xl p-3 bg-slate-50 text-sm text-slate-700">{i}</div>
        ))}
      </div>
    </div>
  );
}

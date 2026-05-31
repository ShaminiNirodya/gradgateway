"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { LineChart, BarChart } from "@/components/ui/simple-chart";

export default function SuperAdminDashboardPage() {
  const { show } = useToast();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-800">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "124,567", delta: "+12.5%" },
          { label: "Revenue This Month", value: "$45,678", delta: "+8.2%" },
          { label: "System Uptime", value: "99.98%", delta: "Excellent" },
          { label: "Storage Used", value: "2.4 TB", delta: "97% of 3TB" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-[18px] p-4 shadow-sm">
            <p className="text-xs text-slate-400">{k.label}</p>
            <h3 className="text-xl font-bold text-slate-800">{k.value}</h3>
            <p className="text-[10px] text-slate-400 mt-1">{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="User Growth" type="line" />
        <ChartCard title="Revenue Analytics" type="bar" />
      </div>

      <div className="bg-white rounded-[18px] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Platform Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["User Management","Admin Management","Platform Analytics","System Settings","Database Management","Subscription Management","Feature Flags"].map((i) => (
            <Button
              key={i}
              variant="outline"
              className="rounded-xl"
              onClick={() => show({ title: `Opening ${i}`, description: "Feature coming soon", variant: "success" })}
            >
              {i}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Export Overview</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => show({ title: "Exported", description: "Overview saved as CSV", variant: "success" })}>Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => show({ title: "Exported", description: "Overview saved as CSV", variant: "success" })}>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, type }: { title: string; type: "line" | "bar" }) {
  const lineData = [
    { label: "Jan", value: 1200 },
    { label: "Feb", value: 1500 },
    { label: "Mar", value: 1800 },
    { label: "Apr", value: 1700 },
    { label: "May", value: 2200 },
    { label: "Jun", value: 2600 },
  ];
  const barData = [
    { label: "Jan", value: 45 },
    { label: "Feb", value: 52 },
    { label: "Mar", value: 49 },
    { label: "Apr", value: 61 },
    { label: "May", value: 58 },
    { label: "Jun", value: 66 },
  ];
  return (
    <div className="bg-white rounded-[18px] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
      {type === "line" ? (
        <LineChart data={lineData} width={600} height={200} className="w-full" />
      ) : (
        <BarChart data={barData} width={600} height={200} className="w-full" />
      )}
    </div>
  );
}

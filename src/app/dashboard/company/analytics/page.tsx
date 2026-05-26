"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { LineChart, BarChart } from "@/components/ui/simple-chart";
import { useEffect, useMemo, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem, OpportunityItem } from "@/lib/types/dashboard";

export default function CompanyAnalyticsPage() {
  const { show } = useToast();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;

        const [apps, jobs] = await Promise.all([
          DashboardService.getCompanyApplications(token),
          DashboardService.getCompanyOpportunities(token),
        ]);

        setApplications(apps);
        setOpportunities(jobs);
      } catch {
        setApplications([]);
        setOpportunities([]);
      }
    };

    load();
  }, []);

  const normalizedStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("short")) return "Shortlisted";
    if (s.includes("interview")) return "Interviewed";
    if (s.includes("offer")) return "Offer Sent";
    if (s.includes("hired") || s.includes("accept")) return "Hired";
    if (s.includes("reject")) return "Rejected";
    return "Applied";
  };

  const totalApplicants = applications.length;
  const shortlisted = applications.filter((a) => normalizedStatus(a.status) === "Shortlisted").length;
  const interviewed = applications.filter((a) => normalizedStatus(a.status) === "Interviewed").length;
  const offers = applications.filter((a) => normalizedStatus(a.status) === "Offer Sent").length;
  const hired = applications.filter((a) => normalizedStatus(a.status) === "Hired").length;

  const kpis = [
    { label: "Total Applicants", value: totalApplicants.toString() },
    { label: "Qualified Candidates", value: shortlisted.toString() },
    { label: "Interview Rate", value: `${totalApplicants ? Math.round((interviewed / totalApplicants) * 100) : 0}%` },
    { label: "Offer Acceptance", value: `${offers ? Math.round((hired / offers) * 100) : 0}%` },
  ];

  const funnel = [
    { stage: "Applied", count: totalApplicants },
    { stage: "Shortlisted", count: shortlisted },
    { stage: "Interviewed", count: interviewed },
    { stage: "Offered", count: offers },
    { stage: "Hired", count: hired },
  ];

  const engagement = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = labels.map((label) => ({ label, value: 0 }));

    applications.forEach((application) => {
      const d = new Date(application.appliedAt);
      const index = d.getDay() === 0 ? 6 : d.getDay() - 1;
      base[index].value += 1;
    });

    return base;
  }, [applications]);

  const topSkills = useMemo(() => {
    const map = new Map<string, number>();
    opportunities.forEach((opportunity) => {
      opportunity.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .forEach((skill) => map.set(skill, (map.get(skill) || 0) + 1));
    });

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([skill]) => skill);
  }, [opportunities]);

  const sourcing = useMemo(() => {
    const total = Math.max(opportunities.length, 1);
    const remote = opportunities.filter((o) => o.workMode.toLowerCase().includes("remote")).length;
    const hybrid = opportunities.filter((o) => o.workMode.toLowerCase().includes("hybrid")).length;
    const onsite = opportunities.filter((o) => o.workMode.toLowerCase().includes("on")).length;

    return [
      { channel: "Remote", score: remote / total },
      { channel: "Hybrid", score: hybrid / total },
      { channel: "Onsite", score: onsite / total },
      { channel: "Internships", score: opportunities.filter((o) => o.opportunityType.toLowerCase().includes("intern")).length / total },
      { channel: "Graduate Roles", score: opportunities.filter((o) => o.opportunityType.toLowerCase().includes("graduate")).length / total },
    ];
  }, [opportunities]);

  const roi = useMemo(() => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const byQuarter = new Map<string, number>(quarters.map((q) => [q, 0]));

    applications.forEach((application) => {
      const month = new Date(application.appliedAt).getMonth();
      const quarter = `Q${Math.floor(month / 3) + 1}`;
      byQuarter.set(quarter, (byQuarter.get(quarter) || 0) + 1);
    });

    return quarters.map((quarter) => ({ label: quarter, value: byQuarter.get(quarter) || 0 }));
  }, [applications]);

  const exportJSON = () => {
    const dashboard = { kpis, funnel, engagement, topSkills, sourcing, roi };
    const blob = new Blob([JSON.stringify(dashboard, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show({ title: "Exported", description: "Dashboard saved as JSON", variant: "success" });
  };

  const exportKPIsCSV = () => {
    const csv = ["label,value", ...kpis.map((k) => `${k.label},${k.value}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpis_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show({ title: "Exported", description: "KPIs saved as CSV", variant: "success" });
  };

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6">
        <h1 className="text-xl font-extrabold">Recruitment Analytics</h1>
        <p className="text-sm opacity-90">Measure pipeline performance, engagement and sourcing effectiveness.</p>
      </div>

      {/* Filters + Export */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Date range:</span>
          <Input placeholder="From" className="h-9 w-32" />
          <Input placeholder="To" className="h-9 w-32" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={exportKPIsCSV}>Export KPIs (CSV)</DropdownMenuItem>
            <DropdownMenuItem onClick={exportJSON}>Export Dashboard (JSON)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-xs text-slate-500">{k.label}</div>
            <div className="text-xl font-bold text-slate-800">{k.value}</div>
          </Card>
        ))}
      </div>

      {/* Funnel */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Hiring Funnel</h3>
        <div className="grid grid-cols-5 gap-4">
          {funnel.map((f, idx) => {
            const max = funnel[0].count;
            const h = Math.max(24, Math.round((f.count / max) * 96));
            const shades = ["bg-indigo-100","bg-indigo-200","bg-indigo-300","bg-indigo-400","bg-indigo-500"];
            return (
              <div key={f.stage} className="space-y-2">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>{f.stage}</span>
                  <span className="font-medium text-slate-700">{f.count}</span>
                </div>
                <div className={`rounded-xl ${shades[idx]}`} style={{ height: h }} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement over time */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Candidate Engagement</h3>
          <LineChart data={engagement} width={700} height={220} className="w-full" />
        </Card>

        {/* Top Skills */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((s) => (
              <Badge key={s} variant="secondary" className="rounded-xl">{s}</Badge>
            ))}
            {!topSkills.length && <span className="text-sm text-slate-500">No skill demand data yet.</span>}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sourcing effectiveness */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Sourcing Effectiveness</h3>
          <div className="space-y-2">
            {sourcing.map((s) => (
              <div key={s.channel} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-500">{s.channel}</div>
                <div className="flex-1 h-3 rounded bg-indigo-100">
                  <div className="h-3 rounded bg-indigo-500" style={{ width: `${Math.round(s.score * 100)}%` }} />
                </div>
                <div className="w-10 text-xs text-slate-700 text-right">{Math.round(s.score * 100)}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ROI */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Recruitment ROI</h3>
          <BarChart data={roi} width={420} height={180} className="w-full" />
        </Card>

        {/* Insights */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Insights</h3>
          <ul className="text-sm space-y-2 text-slate-700">
            <li>Total active job posts: {opportunities.filter((o) => o.isActive).length}.</li>
            <li>Most requested skill: {topSkills[0] || "N/A"}.</li>
            <li>Current interview conversion: {totalApplicants ? Math.round((interviewed / totalApplicants) * 100) : 0}%.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LineChart, BarChart } from "@/components/ui/simple-chart";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ProjectService } from "@/lib/services/project.service";
import { ApplicationItem, ConversationItem, OpportunityItem } from "@/lib/types/dashboard";
import { ProjectItem } from "@/lib/types/project";

export default function StudentAnalyticsPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        const openingsPromise = DashboardService.getStudentOpportunities();

        if (!token) {
          setOpportunities(await openingsPromise);
          setApplications([]);
          setConversations([]);
          setProjects([]);
          return;
        }

        const [openings, myApps, myConversations, myProjects] = await Promise.all([
          openingsPromise,
          DashboardService.getMyApplications(token),
          DashboardService.getMyConversations(token),
          ProjectService.getMyProjects(token),
        ]);

        setOpportunities(openings);
        setApplications(myApps);
        setConversations(myConversations);
        setProjects(myProjects);
      } catch {
        setOpportunities([]);
        setApplications([]);
        setConversations([]);
        setProjects([]);
      }
    };

    load();
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Open Opportunities", value: opportunities.length.toString() },
      { label: "My Applications", value: applications.length.toString() },
      { label: "Active Conversations", value: conversations.length.toString() },
      { label: "My Projects", value: projects.length.toString() },
    ],
    [opportunities.length, applications.length, conversations.length, projects.length]
  );

  const weeklyApplications = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = labels.map((label) => ({ label, value: 0 }));

    applications.forEach((application) => {
      const d = new Date(application.appliedAt);
      const jsDay = d.getDay();
      const index = jsDay === 0 ? 6 : jsDay - 1;
      base[index].value += 1;
    });

    return base;
  }, [applications]);

  const skillDemand = useMemo(() => {
    const map = new Map<string, number>();

    opportunities.forEach((opportunity) => {
      opportunity.requiredSkills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((skill) => map.set(skill, (map.get(skill) || 0) + 1));
    });

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [opportunities]);

  const recentConversations = useMemo(
    () =>
      [...conversations]
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        .slice(0, 5),
    [conversations]
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">Live metrics from your GradGateway data.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => {
            const payload = {
              opportunities,
              applications,
              conversations,
              projects,
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "student-analytics.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[18px] p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Applications by Weekday</h3>
          <LineChart data={weeklyApplications} width={700} height={300} className="w-full" />
        </div>

        <div className="bg-white rounded-[18px] p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Top Skill Demand</h3>
          <BarChart data={skillDemand} width={300} height={220} className="w-full" />
        </div>
      </div>

      <div className="bg-white rounded-[18px] p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Recent Conversations</h3>
        <div className="space-y-3">
          {recentConversations.map((conversation) => (
            <div key={conversation.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-800">{conversation.otherPartyName}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{conversation.lastMessage || "No message content"}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(conversation.lastMessageAt).toLocaleDateString("en-LK")}</span>
            </div>
          ))}
          {!recentConversations.length && <p className="text-sm text-slate-500">No conversation data available.</p>}
        </div>
      </div>
    </div>
  );
}

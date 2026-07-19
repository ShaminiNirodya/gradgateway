"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart } from "@/components/ui/simple-chart";
import { AnalyticsKpiCard, AnalyticsSection } from "@/components/features/analytics/AnalyticsCards";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ProjectService } from "@/lib/services/project.service";
import { ApplicationItem, ConversationItem, OpportunityItem } from "@/lib/types/dashboard";
import { ProjectItem } from "@/lib/types/project";
import {
  APPLICATION_STATUS_OPTIONS,
  normalizeApplicationStatus,
} from "@/lib/constants/application-status";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";
import { StudentPageHero } from "@/components/layout/student/StudentPageHero";

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

    void load();
  }, []);

  const activeApplications = useMemo(
    () =>
      applications.filter(
        (app) => !["Rejected", "Hired"].includes(normalizeApplicationStatus(app.status))
      ).length,
    [applications]
  );

  const hiredCount = useMemo(
    () => applications.filter((app) => normalizeApplicationStatus(app.status) === "Hired").length,
    [applications]
  );

  const responseRate = useMemo(() => {
    if (applications.length === 0) return 0;
    const responded = applications.filter(
      (app) => !["New"].includes(normalizeApplicationStatus(app.status))
    ).length;
    return Math.round((responded / applications.length) * 100);
  }, [applications]);

  const pipeline = useMemo(() => {
    return APPLICATION_STATUS_OPTIONS.map((option) => ({
      label: option.label,
      value: applications.filter(
        (app) => normalizeApplicationStatus(app.status) === option.filterKey
      ).length,
    }));
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

  const exportCsv = () => {
    const sections = [
      "Student Analytics Export",
      `Generated,${new Date().toISOString()}`,
      "",
      "KPI,Value",
      `Open opportunities,${opportunities.length}`,
      `Active applications,${activeApplications}`,
      `Hired outcomes,${hiredCount}`,
      `Recruiter response rate,${responseRate}%`,
      "",
      "Application pipeline,Count",
      ...pipeline.map((row) => `"${row.label}",${row.value}`),
      "",
      "Skills in demand,Job count",
      ...skillDemand.map((row) => `"${row.label}",${row.value}`),
    ];

    const blob = new Blob([sections.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudentPageContainer className="space-y-8 pb-10">
      <StudentPageHero
        eyebrow="Insights"
        title="Your job search analytics"
        description="Track how your applications, skills, and recruiter conversations are progressing on GradGateway."
        actions={
          <Button variant="outline" size="sm" className="rounded-xl" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsKpiCard
          label="Open opportunities"
          value={opportunities.length.toString()}
          hint="Live job posts you can still apply to right now."
        />
        <AnalyticsKpiCard
          label="Active applications"
          value={activeApplications.toString()}
          hint="Applications still in progress — not rejected or hired yet."
        />
        <AnalyticsKpiCard
          label="Recruiter response rate"
          value={`${responseRate}%`}
          hint="Share of applications that moved beyond the initial submitted stage."
        />
        <AnalyticsKpiCard
          label="Hired outcomes"
          value={hiredCount.toString()}
          hint="Applications that reached a hired result on the platform."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsSection
          title="Application pipeline"
          description="Where your applications sit today across the hiring stages."
          className="lg:col-span-2"
        >
          <BarChart
            data={pipeline}
            height={260}
            emptyLabel="Apply to openings to start building your pipeline."
          />
        </AnalyticsSection>

        <AnalyticsSection
          title="Portfolio projects"
          description="Published projects recruiters can review when you apply or message."
        >
          <p className="text-4xl font-bold text-slate-800">{projects.length}</p>
          <p className="mt-2 text-sm text-slate-500">
            {projects.length === 0
              ? "Add a project to strengthen your profile and applications."
              : `${projects.length} project${projects.length === 1 ? "" : "s"} visible on your profile.`}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
            <Link href="/dashboard/student/projects">Manage projects</Link>
          </Button>
        </AnalyticsSection>
      </div>

      <AnalyticsSection
        title="Skills employers want"
        description="Most requested skills across the openings currently visible to you."
      >
        <BarChart
          data={skillDemand}
          height={260}
          color="#6C5DD3"
          emptyLabel="Browse openings to see which skills companies are asking for."
        />
      </AnalyticsSection>

      <AnalyticsSection
        title="Recent recruiter conversations"
        description="Latest message threads with companies — follow up where activity is highest."
      >
        <div className="space-y-3">
          {recentConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/student/messages?conversationId=${conversation.id}`}
              className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{conversation.otherPartyName}</p>
                <p className="truncate text-xs text-slate-500">
                  {conversation.lastMessage || "No messages yet"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {new Date(conversation.lastMessageAt).toLocaleDateString("en-LK")}
              </span>
            </Link>
          ))}
          {!recentConversations.length && (
            <p className="text-sm text-slate-500">
              Start messaging recruiters from applications or openings to see activity here.
            </p>
          )}
        </div>
      </AnalyticsSection>
    </StudentPageContainer>
  );
}

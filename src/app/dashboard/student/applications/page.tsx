"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  MessageSquare,
  Briefcase,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem } from "@/lib/types/dashboard";
import { downloadApplicationsCsv } from "@/lib/utils/export-applications-csv";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  applicationStatusBadgeClass,
  applicationStatusLabel,
  isDirectJobOfferApplication,
  matchesApplicationFilter,
  normalizeApplicationStatus,
} from "@/lib/constants/application-status";
import { getApplicationProgressModel } from "@/lib/utils/application-progress";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";
import { StudentPageHero } from "@/components/layout/student/StudentPageHero";
import {
  applicationHighlightElementId,
  scrollAndHighlightElement,
} from "@/lib/utils/highlight-target";
import {
  resolveApplicationIdFromNotification,
  studentApplicationsTabForApp,
} from "@/lib/utils/notifications";
import type { NotificationItem } from "@/lib/types/dashboard";

export default function StudentApplicationsPage() {
  const { show } = useToast();
  const searchParams = useSearchParams();
  const applicationIdParam = searchParams.get("applicationId");
  const jobTitleParam = searchParams.get("jobTitle");
  const opportunityIdParam = searchParams.get("opportunityId");
  const filterParam = searchParams.get("filter");
  const highlightParam = searchParams.get("highlight");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [myApplications, setMyApplications] = useState<ApplicationItem[]>([]);
  const highlightTabAdjustedRef = useRef(false);

  const loadApplications = async () => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await DashboardService.syncOfferRepliesFromMessages(token).catch(() => undefined);
      const apps = await DashboardService.getMyApplications(token);
      setMyApplications(apps);
    } catch (error: unknown) {
      setMyApplications([]);
      const message =
        error instanceof Error ? error.message : "Could not load your applications.";
      show({
        title: "Applications unavailable",
        description: message,
        variant: "error",
      });
    }
  };

  useEffect(() => {
    loadApplications();
    const refreshOnFocus = () => loadApplications();
    const refreshFromMessages = () => loadApplications();
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") loadApplications();
    };
    window.addEventListener("focus", refreshOnFocus);
    window.addEventListener("applications:refresh", refreshFromMessages);
    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      window.removeEventListener("applications:refresh", refreshFromMessages);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, []);

  useEffect(() => {
    highlightTabAdjustedRef.current = false;
  }, [applicationIdParam, jobTitleParam, opportunityIdParam, filterParam, highlightParam]);

  useEffect(() => {
    if (filterParam) setActiveTab(filterParam);
  }, [filterParam]);

  const highlightApplicationId = useMemo(() => {
    if (applicationIdParam) return applicationIdParam;
    if (!myApplications.length || (!jobTitleParam && !opportunityIdParam)) return null;

    const stub: NotificationItem = {
      id: "",
      type: "Application",
      title: filterParam === "Hired" ? "Congratulations — you're hired!" : "Application Status Updated",
      body: jobTitleParam
        ? filterParam === "Hired"
          ? `Company hired you for ${jobTitleParam}.`
          : `Your application for ${jobTitleParam} is now updated.`
        : "",
      isRead: true,
      createdAt: new Date().toISOString(),
      relatedOpportunityId: opportunityIdParam,
    };
    return resolveApplicationIdFromNotification(stub, myApplications);
  }, [
    applicationIdParam,
    filterParam,
    jobTitleParam,
    myApplications,
    opportunityIdParam,
  ]);

  const filtered = useMemo(() => {
    if (activeTab === "All") return myApplications;
    return myApplications.filter((c) => matchesApplicationFilter(c, activeTab));
  }, [activeTab, myApplications]);

  useEffect(() => {
    const targetId = highlightApplicationId ?? applicationIdParam;
    if (highlightParam !== "1" || !targetId || !myApplications.length) return;

    const isVisible = filtered.some((a) => a.id === targetId);
    if (isVisible) {
      scrollAndHighlightElement(applicationHighlightElementId(targetId));
      return;
    }

    if (highlightTabAdjustedRef.current) return;
    const app = myApplications.find((a) => a.id === targetId);
    if (!app) return;

    highlightTabAdjustedRef.current = true;
    setActiveTab(studentApplicationsTabForApp(app));
  }, [highlightParam, highlightApplicationId, applicationIdParam, myApplications, filtered]);

  const stats = [
    { label: "Total Applications", value: myApplications.length },
    {
      label: "Active",
      value: myApplications.filter(
        (a) => !["Rejected", "Hired"].includes(normalizeApplicationStatus(a.status))
      ).length,
    },
    {
      label: "Shortlisted",
      value: myApplications.filter((a) => normalizeApplicationStatus(a.status) === "Shortlisted")
        .length,
    },
    {
      label: "Interviewed",
      value: myApplications.filter((a) => normalizeApplicationStatus(a.status) === "Interviewed")
        .length,
    },
    {
      label: "Offers",
      value: myApplications.filter((a) => matchesApplicationFilter(a, "Offers")).length,
    },
  ];

  return (
    <StudentPageContainer>
      <StudentPageHero
        eyebrow="Track progress"
        title="My Applications"
        description="Monitor status updates and follow up with recruiters"
        actions={
          <>
          <div className="flex gap-1 rounded-xl border border-slate-200/80 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={cn(
                "rounded-lg p-2.5 transition-colors",
                view === "grid" ? "bg-white text-[#6C5DD3] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn(
                "rounded-lg p-2.5 transition-colors",
                view === "list" ? "bg-white text-[#6C5DD3] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
          <Button
            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
            onClick={() => {
              if (myApplications.length === 0) {
                show({
                  title: "Nothing to export",
                  description: "You have no applications yet.",
                  variant: "warning",
                });
                return;
              }
              downloadApplicationsCsv(myApplications, normalizeApplicationStatus);
              show({
                title: "Export complete",
                description: `Downloaded ${myApplications.length} application(s) as CSV.`,
                variant: "success",
              });
            }}
          >
            <Download className="w-4 h-4 mr-2" /> Export History
          </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {stats.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-[#6C5DD3]/15"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k.label}</p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{k.value}</h3>
          </div>
        ))}
      </div>

      <div className="neu-filter-bar rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("All")}
            className={cn("btn-neu-fill", activeTab === "All" && "btn-neu-fill-active")}
          >
            All
          </button>
          {(["New", "Shortlisted", "Interviewed", "Hired", "Rejected"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={cn("btn-neu-fill", activeTab === t && "btn-neu-fill-active")}
            >
              {t === "New" ? "New Applied" : t}
            </button>
          ))}

          <span
            className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline-block"
            aria-hidden
          />

          <button
            type="button"
            onClick={() => setActiveTab("Offers")}
            className={cn("btn-neu-fill", activeTab === "Offers" && "btn-neu-fill-active")}
          >
            Offers
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="font-bold text-slate-700">No applications found in this category.</p>
          {activeTab === "Offers" ? (
            <p className="mt-2 text-sm text-slate-500">
              Pending direct job offers appear here. If you declined an offer in Messages, check the
              Rejected tab.
            </p>
          ) : null}
          <Button asChild variant="link" className="mt-2">
            <Link href="/dashboard/student/openings">Browse and apply for jobs</Link>
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <ApplicationGridCard key={c.id} application={c} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
          {filtered.map((c) => (
            <ApplicationListRow key={c.id} application={c} />
          ))}
        </div>
      )}
    </StudentPageContainer>
  );
}

function ApplicationGridCard({ application: c }: { application: ApplicationItem }) {
  const statusKey = normalizeApplicationStatus(c.status);
  const statusLabel = applicationStatusLabel(c.status);

  return (
    <div
      id={applicationHighlightElementId(c.id)}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C5DD3]/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-slate-900">{c.companyName}</h3>
            {isDirectJobOfferApplication(c.opportunityId, c.status, c.companyProfileId) ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200">
                Direct offer
              </span>
            ) : null}
          </div>
          <p className="text-sm font-medium text-slate-600">{c.jobTitle}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Applied {new Date(c.appliedAt).toLocaleDateString("en-LK")}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ring-inset",
            applicationStatusBadgeClass(statusKey)
          )}
        >
          {statusLabel}
        </span>
      </div>
      <ApplicationProgress
        status={c.status}
        opportunityId={c.opportunityId}
        companyProfileId={c.companyProfileId}
      />
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {c.opportunityId ? (
          <Button asChild size="sm" variant="outline" className="rounded-lg">
            <Link href={`/dashboard/student/openings/${c.opportunityId}`}>
              <Eye className="mr-2 h-4 w-4" /> View Listing
            </Link>
          </Button>
        ) : null}
        <Button asChild size="sm" className="rounded-lg">
          <Link
            href={
              c.opportunityId
                ? `/dashboard/student/messages?opportunityId=${encodeURIComponent(c.opportunityId)}&applicationId=${encodeURIComponent(c.id)}`
                : "/dashboard/student/messages"
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ApplicationListRow({ application: c }: { application: ApplicationItem }) {
  const statusKey = normalizeApplicationStatus(c.status);
  const statusLabel = applicationStatusLabel(c.status);

  return (
    <div
      id={applicationHighlightElementId(c.id)}
      className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold text-slate-900">{c.companyName}</h3>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ring-1 ring-inset",
              applicationStatusBadgeClass(statusKey)
            )}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-slate-600">{c.jobTitle}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Applied {new Date(c.appliedAt).toLocaleDateString("en-LK")}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {c.opportunityId ? (
          <Button asChild size="sm" variant="outline" className="rounded-lg">
            <Link href={`/dashboard/student/openings/${c.opportunityId}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Link>
          </Button>
        ) : null}
        <Button asChild size="sm" className="rounded-lg">
          <Link
            href={
              c.opportunityId
                ? `/dashboard/student/messages?opportunityId=${encodeURIComponent(c.opportunityId)}&applicationId=${encodeURIComponent(c.id)}`
                : "/dashboard/student/messages"
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ApplicationProgress({
  status,
  opportunityId,
  companyProfileId,
}: {
  status: string;
  opportunityId?: string | null;
  companyProfileId?: string | null;
}) {
  const { steps, activeKey, completedThroughIndex } = getApplicationProgressModel(
    status,
    opportunityId,
    companyProfileId
  );

  return (
    <div className="mt-6 flex items-center gap-1">
      {steps.map((step, i) => {
        const isCompleted = i <= completedThroughIndex;
        const isActive = step.key === activeKey;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black transition-all",
                  isCompleted ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-400"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-center text-[9px] font-bold uppercase tracking-tight",
                  isActive ? "text-[#6C5DD3]" : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "-mt-4 h-0.5 flex-1 transition-all",
                  i < completedThroughIndex ? "bg-[#6C5DD3]" : "bg-slate-100"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}


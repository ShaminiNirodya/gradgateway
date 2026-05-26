"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays, Download, Eye, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem } from "@/lib/types/dashboard";

export default function StudentApplicationsPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [calendarView, setCalendarView] = useState(false);
  const [myApplications, setMyApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;
        const apps = await DashboardService.getMyApplications(token);
        setMyApplications(apps);
      } catch {
        setMyApplications([]);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "All") return myApplications;
    return myApplications.filter((c) => normalizeStatus(c.status) === activeTab);
  }, [activeTab, myApplications]);

  // ... (rest of the component)

  // Update stats based on real data
  const stats = [
    { label: "Total Applications", value: myApplications.length },
    { label: "Active", value: myApplications.filter(a => !['Rejected', 'Hired'].includes(normalizeStatus(a.status))).length },
    { label: "Shortlisted", value: myApplications.filter(a => normalizeStatus(a.status) === 'Shortlisted').length },
    { label: "Interviewed", value: myApplications.filter(a => normalizeStatus(a.status) === 'Interviewed').length },
  ];

  return (
    <div className="space-y-8">
      {/* ... header ... */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">My Applications</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCalendarView((v) => !v)}>
            <CalendarDays className="w-4 h-4 mr-2" /> {calendarView ? "List View" : "Calendar View"}
          </Button>
          <Button onClick={() => {
            const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "applications.json";
            a.click();
            URL.revokeObjectURL(url);
          }}><Download className="w-4 h-4 mr-2" /> Export History</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((k) => (
          <div key={k.label} className="bg-white rounded-[18px] p-4 shadow-sm">
            <p className="text-xs text-slate-400">{k.label}</p>
            <h3 className="text-xl font-bold text-slate-800">{k.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs row */}
      <div className="bg-white rounded-[18px] p-3 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {["All", "New", "Shortlisted", "Interviewed", "Offer Sent", "Hired", "Rejected"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${activeTab === t ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {t === "New" ? "New Applied" : t}
            </button>
          ))}
        </div>
      </div>

      {!calendarView && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length > 0 ? filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-[18px] p-6 shadow-sm border border-slate-50 hover:border-indigo-100 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{c.companyName}</h3>
                  <p className="text-sm text-slate-500 font-medium">{c.jobTitle}</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Applied: {new Date(c.appliedAt).toLocaleDateString("en-LK")}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider ${mapStatus(normalizeStatus(c.status))}`}>{normalizeStatus(c.status)}</span>
              </div>
              <div className="flex items-center gap-1 mt-6">
                {[
                  { label: 'Applied', status: 'New' },
                  { label: 'Shortlisted', status: 'Shortlisted' },
                  { label: 'Interviewed', status: 'Interviewed' },
                  { label: 'Offer', status: 'Offer Sent' },
                  { label: 'Result', status: ['Hired', 'Rejected'] }
                ].map((s, i) => {
                  const statusOrder = ['New', 'Shortlisted', 'Interviewed', 'Offer Sent', 'Hired', 'Rejected'];
                  const normalized = normalizeStatus(c.status);
                  const currentStep = statusOrder.indexOf(normalized);

                  // For the 'Result' stage, any of Hired or Rejected counts as completed
                  const isHiredOrRejected = ['Hired', 'Rejected'].includes(normalized);
                  const targetIndex = Array.isArray(s.status) ? 4 : statusOrder.indexOf(s.status);

                  let isCompleted = currentStep >= targetIndex;
                  let isActive = Array.isArray(s.status) ? isHiredOrRejected : normalized === s.status;

                  return (
                    <React.Fragment key={s.label}>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isCompleted ? 'bg-[#6C5DD3] text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'text-[#6C5DD3]' : 'text-slate-400'}`}>{s.label}</span>
                      </div>
                      {i < 4 && <div className={`h-[2px] flex-1 -mt-4 transition-all ${isCompleted ? 'bg-[#6C5DD3]' : 'bg-slate-100'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Button asChild size="sm" variant="outline" className="rounded-xl"><Link href={`/dashboard/student/openings/${c.opportunityId}`}><Eye className="w-4 h-4 mr-2" /> View Listing</Link></Button>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href={`/dashboard/student/messages?opportunityId=${encodeURIComponent(c.opportunityId)}&applicationId=${encodeURIComponent(c.id)}`}>
                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                  </Link>
                </Button>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
              <Briefcase className="w-12 h-12 mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No applications found in this category.</p>
              <Button asChild variant="link" className="mt-2"><Link href="/dashboard/student/openings">Browse and apply for jobs</Link></Button>
            </div>
          )}
        </div>
      )}


      {calendarView && (
        <div className="bg-white rounded-[18px] p-6 shadow-sm">
          <p className="text-sm text-slate-600">Calendar view is a placeholder. Integrate your calendar component here.</p>
        </div>
      )}
    </div>
  );
}

function normalizeStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("new") || lower.includes("applied") || lower.includes("submitted")) return "New";
  if (lower.includes("short")) return "Shortlisted";
  if (lower.includes("interview")) return "Interviewed";
  if (lower.includes("offer")) return "Offer Sent";
  if (lower.includes("hire") || lower.includes("accept")) return "Hired";
  if (lower.includes("reject")) return "Rejected";
  return "New";
}

function mapStatus(s: string) {
  const m: Record<string, string> = {
    "New": "bg-blue-100 text-blue-700",
    "Shortlisted": "bg-purple-100 text-purple-700",
    "Interviewed": "bg-amber-100 text-amber-700",
    "Offer Sent": "bg-emerald-100 text-emerald-700",
    "Hired": "bg-indigo-100 text-indigo-700",
    "Rejected": "bg-red-100 text-red-700",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

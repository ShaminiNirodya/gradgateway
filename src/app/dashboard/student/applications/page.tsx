"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays, Download, Eye, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem } from "@/lib/types/dashboard";
import { downloadApplicationsCsv } from "@/lib/utils/export-applications-csv";
import { useToast } from "@/components/ui/toast";

export default function StudentApplicationsPage() {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [calendarView, setCalendarView] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
          <Button
            onClick={() => {
              if (myApplications.length === 0) {
                show({
                  title: "Nothing to export",
                  description: "You have no applications yet.",
                  variant: "warning",
                });
                return;
              }
              downloadApplicationsCsv(myApplications, normalizeStatus);
              show({
                title: "Export complete",
                description: `Downloaded ${myApplications.length} application(s) as CSV.`,
                variant: "success",
              });
            }}
          >
            <Download className="w-4 h-4 mr-2" /> Export History
          </Button>
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
          {["All", "New", "Shortlisted", "Interviewed", "Offers", "Hired", "Rejected"].map((t) => (
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
        <ApplicationsCalendarView
          applications={filtered}
          month={calendarMonth}
          selectedDate={selectedDate}
          onMonthChange={setCalendarMonth}
          onSelectDate={setSelectedDate}
        />
      )}
    </div>
  );
}

function normalizeStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("new") || lower.includes("applied") || lower.includes("submitted")) return "New";
  if (lower.includes("short")) return "Shortlisted";
  if (lower.includes("interview")) return "Interviewed";
  if (lower.includes("offer")) return "Offers";
  if (lower.includes("hire") || lower.includes("accept")) return "Hired";
  if (lower.includes("reject")) return "Rejected";
  return "New";
}

function ApplicationsCalendarView({
  applications,
  month,
  selectedDate,
  onMonthChange,
  onSelectDate,
}: {
  applications: ApplicationItem[];
  month: Date;
  selectedDate: string | null;
  onMonthChange: (date: Date) => void;
  onSelectDate: (isoDate: string | null) => void;
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const appsByDate = useMemo(() => {
    const map = new Map<string, ApplicationItem[]>();
    for (const app of applications) {
      const key = new Date(app.appliedAt).toISOString().slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(app);
      map.set(key, list);
    }
    return map;
  }, [applications]);

  const monthLabel = firstDay.toLocaleDateString("en-LK", { month: "long", year: "numeric" });
  const selectedDayApps = selectedDate ? appsByDate.get(selectedDate) ?? [] : [];

  const cells: Array<{ day: number | null; iso: string | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, iso: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = new Date(year, monthIndex, day).toISOString().slice(0, 10);
    cells.push({ day, iso });
  }

  const shiftMonth = (delta: number) => {
    onMonthChange(new Date(year, monthIndex + delta, 1));
    onSelectDate(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[18px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
            Previous
          </Button>
          <p className="text-sm font-bold text-slate-800">{monthLabel}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(1)}>
            Next
          </Button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          See when you applied to each role. Days with a purple dot have applications.
        </p>
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase text-slate-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">
          {cells.map((cell, index) => {
            if (cell.day == null || !cell.iso) {
              return <div key={`empty-${index}`} className="h-12" />;
            }
            const count = appsByDate.get(cell.iso)?.length ?? 0;
            const isSelected = selectedDate === cell.iso;
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => onSelectDate(isSelected ? null : cell.iso)}
                className={`h-12 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-[#6C5DD3] text-white shadow-md"
                    : count > 0
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cell.day}
                {count > 0 ? (
                  <span className={`block mx-auto mt-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#6C5DD3]"}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[18px] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          {selectedDate
            ? `Applications on ${new Date(selectedDate).toLocaleDateString("en-LK", { dateStyle: "medium" })}`
            : "Select a day to see applications"}
        </h3>
        {selectedDate && selectedDayApps.length === 0 ? (
          <p className="text-sm text-slate-500">No applications on this date.</p>
        ) : null}
        <div className="space-y-3">
          {(selectedDate ? selectedDayApps : applications).map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <p className="text-sm font-bold text-slate-800">{app.companyName}</p>
                <p className="text-xs text-slate-500">{app.jobTitle}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase ${mapStatus(normalizeStatus(app.status))}`}>
                {normalizeStatus(app.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mapStatus(s: string) {
  const m: Record<string, string> = {
    "New": "bg-blue-100 text-blue-700",
    "Shortlisted": "bg-purple-100 text-purple-700",
    "Interviewed": "bg-amber-100 text-amber-700",
    "Offers": "bg-emerald-100 text-emerald-700",
    "Hired": "bg-indigo-100 text-indigo-700",
    "Rejected": "bg-red-100 text-red-700",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

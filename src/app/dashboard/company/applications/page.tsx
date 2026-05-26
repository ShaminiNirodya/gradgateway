"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List as ListIcon, Search, Eye, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem } from "@/lib/types/dashboard";

const STATUSES = ["New", "Shortlisted", "Interviewed", "Offer Sent", "Hired", "Rejected"] as const;

export default function ApplicationManagement() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setApplications([]);
          return;
        }

        const rows = await DashboardService.getCompanyApplications(token);
        setApplications(rows);
      } catch {
        setApplications([]);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.studentName.toLowerCase().includes(search.toLowerCase()) ||
        application.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        application.studentEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? application.status === statusFilter : true;
      const matchesJob = jobIdParam ? application.opportunityId === jobIdParam : true;
      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applications, search, statusFilter, jobIdParam]);

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const updated = await DashboardService.updateApplicationStatus(token, applicationId, status);
      setApplications((prev) => prev.map((application) => (application.id === applicationId ? updated : application)));
    } catch {
      // keep current state
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Application Hub</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            {jobIdParam ? `Position ID: ${jobIdParam}` : "Talent Acquisition Dashboard"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search candidate, email, role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-11 h-12 w-80 bg-white shadow-sm rounded-2xl border-slate-100"
            />
          </div>
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button
              onClick={() => setView("board")}
              className={`p-2.5 rounded-xl transition-all duration-300 ${view === "board" ? "bg-white text-indigo-600 shadow-md" : "text-slate-500"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 rounded-xl transition-all duration-300 ${view === "list" ? "bg-white text-indigo-600 shadow-md" : "text-slate-500"}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl p-3 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-2 rounded-xl text-xs font-bold ${statusFilter === null ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
          >
            All
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${statusFilter === status ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-8">
          {filtered.map((application) => (
            <div key={application.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{application.studentName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800">{application.studentName}</h3>
                    <p className="text-xs text-slate-500">{application.studentEmail}</p>
                  </div>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {application.jobTitle}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Applied {new Date(application.appliedAt).toLocaleDateString("en-LK")}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href={`/dashboard/company/candidate/${encodeURIComponent(application.studentName.toLowerCase().replace(/\s+/g, '-'))}?id=${application.studentProfileId}&email=${encodeURIComponent(application.studentEmail)}`}>
                    <Eye className="w-4 h-4 mr-2" /> View Profile
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">Update Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    {STATUSES.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => updateStatus(application.id, status)}>
                        Move to {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-slate-500">No applications found.</div>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Job</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((application) => (
                <tr key={application.id} className="border-b border-slate-50">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{application.studentName}</div>
                    <div className="text-xs text-slate-500">{application.studentEmail}</div>
                  </td>
                  <td className="p-4">{application.jobTitle}</td>
                  <td className="p-4"><StatusBadge status={application.status} /></td>
                  <td className="p-4">{new Date(application.appliedAt).toLocaleDateString("en-LK")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: "bg-blue-50 text-blue-600 ring-blue-100",
    Shortlisted: "bg-purple-50 text-purple-600 ring-purple-100",
    Interviewed: "bg-amber-50 text-amber-600 ring-amber-100",
    "Offer Sent": "bg-emerald-50 text-emerald-600 ring-emerald-100",
    Hired: "bg-violet-50 text-violet-600 ring-violet-100",
    Rejected: "bg-slate-50 text-slate-500 ring-slate-100",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ring-1 ring-inset", styles[status] || "bg-gray-100 text-gray-700 ring-gray-200")}>
      {status}
    </span>
  );
}

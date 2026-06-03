"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { StudentService } from "@/lib/services/student.service";
import { API_ENDPOINTS } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Search, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShareableJob = {
  id: string;
  title: string;
  type: string;
  location: string;
  workMode: string;
  description?: string;
  monthlyStipendLkr?: number;
};

type StudentOption = {
  studentProfileId: string;
  fullName: string;
  email: string;
  university: string;
  photoDataUrl?: string;
};

function mapOpportunityTypeToJobType(type: string): string {
  const labels: Record<string, string> = {
    Internship: "Internship",
    GraduateRole: "Full-time",
    PartTime: "Part-time",
    Contract: "Full-time",
  };
  return labels[type] ?? "Full-time";
}

function formatWorkModeLabel(mode: string): string {
  if (mode === "Remote") return "Online";
  return mode.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function buildOfferMessage(job: ShareableJob): string {
  const lines = [
    `We would like to share our job opening "${job.title}" with you.`,
    "",
    job.description?.trim() || "Please review the role details and let us know if you are interested.",
    "",
    `Type: ${mapOpportunityTypeToJobType(job.type)}`,
    `Work mode: ${formatWorkModeLabel(job.workMode)}`,
    `Location: ${job.location}`,
  ];
  return lines.join("\n");
}

type ShareJobAsOfferDialogProps = {
  job: ShareableJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ShareJobAsOfferDialog({
  job,
  open,
  onOpenChange,
}: ShareJobAsOfferDialogProps) {
  const { show } = useToast();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedStudentId("");
      setIsSent(false);
      return;
    }

    const load = async () => {
      setLoadingStudents(true);
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;
        const rows = await StudentService.getStudentDirectory(token);
        setStudents(
          rows
            .filter((r) => r.studentProfileId)
            .map((r) => ({
              studentProfileId: r.studentProfileId,
              fullName: r.fullName,
              email: r.email,
              university: r.university,
              photoDataUrl: r.photoDataUrl,
            }))
        );
      } catch {
        setStudents([]);
        show({
          title: "Could not load students",
          description: "Try again from Talent Search.",
          variant: "error",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    load();
  }, [open, show]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.university.toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedStudent = students.find((s) => s.studentProfileId === selectedStudentId);

  const handleSend = async () => {
    if (!job || !selectedStudentId) {
      show({
        title: "Select a student",
        description: "Choose who should receive this offer.",
        variant: "warning",
      });
      return;
    }

    setIsSending(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) throw new Error("Please sign in again.");

      const proposalMessage = buildOfferMessage(job);
      const compensation = job.monthlyStipendLkr
        ? String(job.monthlyStipendLkr)
        : null;

      const offerResponse = await fetch(API_ENDPOINTS.APPLICATIONS.CREATE_JOB_OFFER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentProfileId: selectedStudentId,
          jobTitle: job.title,
          jobType: mapOpportunityTypeToJobType(job.type),
          compensation,
          proposalMessage,
          opportunityId: job.id,
        }),
      });

      if (!offerResponse.ok) {
        const errBody = await offerResponse.json().catch(() => ({}));
        const message =
          (errBody as { message?: string }).message ||
          (errBody as { detail?: string }).detail ||
          "Failed to create job offer";
        throw new Error(message);
      }

      const offerApplication = (await offerResponse.json()) as { id: string };

      let conversationId: string | null = null;
      const conversations = await DashboardService.getMyConversations(token);
      const existing = conversations.find(
        (c) =>
          !c.opportunityId &&
          c.otherPartyName.toLowerCase() === selectedStudent?.fullName.toLowerCase()
      );
      if (existing) {
        conversationId = existing.id;
      } else {
        const created = await DashboardService.startConversation(token, {
          studentProfileId: selectedStudentId,
        });
        conversationId = created.id;
      }

      const formattedOfferMessage = `JOB_OFFER::${JSON.stringify({
        applicationId: offerApplication.id,
        position: job.title,
        jobType: mapOpportunityTypeToJobType(job.type),
        compensation,
        message: proposalMessage,
        note: `Shared from job post: ${job.title}`,
      })}`;

      await DashboardService.sendConversationMessage(token, conversationId, formattedOfferMessage);

      setIsSent(true);
      show({
        title: "Offer shared",
        description: `Job offer sent to ${selectedStudent?.fullName ?? "the student"}.`,
        variant: "success",
      });

      setTimeout(() => {
        onOpenChange(false);
        setIsSent(false);
      }, 1800);
    } catch (error: unknown) {
      show({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Unable to share this offer.",
        variant: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {isSent ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Offer shared</h3>
            <p className="text-slate-500 text-sm">The student can view it in Messages and Applications.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Share as an offer</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{job.title}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students by name, email, or university..."
                  className="pl-10 h-11 rounded-xl"
                />
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {loadingStudents ? (
                  <p className="p-6 text-center text-sm text-slate-500">Loading students...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">No students match your search.</p>
                ) : (
                  filteredStudents.map((student) => {
                    const selected = selectedStudentId === student.studentProfileId;
                    return (
                      <button
                        key={student.studentProfileId}
                        type="button"
                        onClick={() => setSelectedStudentId(student.studentProfileId)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                          selected ? "bg-indigo-50" : "hover:bg-slate-50"
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.photoDataUrl} alt={student.fullName} />
                          <AvatarFallback className="bg-[#6C5DD3] text-white text-xs font-bold">
                            {student.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate">{student.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{student.university}</p>
                        </div>
                        {selected ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6C5DD3]" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 h-12 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
                onClick={handleSend}
                disabled={isSending || !selectedStudentId}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send offer"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";

type ScheduleInterviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opportunityId: string;
    jobTitle: string;
    onScheduled?: (result: { messagesSent: number; shortlistedCount: number }) => void;
};

export default function ScheduleInterviewDialog({
    open,
    onOpenChange,
    opportunityId,
    jobTitle,
    onScheduled,
}: ScheduleInterviewDialogProps) {
    const { show } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("60");
    const [mode, setMode] = useState("Online");
    const [meetingLink, setMeetingLink] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");

    const resetForm = () => {
        setScheduledDate("");
        setDurationMinutes("60");
        setMode("Online");
        setMeetingLink("");
        setLocation("");
        setNotes("");
        setIsDone(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!scheduledDate) {
            show({
                title: "Date required",
                description: "Please choose an interview date.",
                variant: "warning",
            });
            return;
        }

        const [year, month, day] = scheduledDate.split("-").map(Number);
        const scheduledAt = new Date(Date.UTC(year, month - 1, day));
        if (Number.isNaN(scheduledAt.getTime())) {
            show({
                title: "Invalid date",
                description: "Please check the interview date.",
                variant: "warning",
            });
            return;
        }

        setIsSending(true);

        try {
            const token = await AuthService.getIdToken();
            if (!token) {
                throw new Error("Please sign in again.");
            }

            const result = await DashboardService.scheduleInterviews(token, opportunityId, {
                scheduledAt: scheduledAt.toISOString(),
                durationMinutes: Number.parseInt(durationMinutes, 10) || 60,
                mode,
                meetingLink: meetingLink.trim() || null,
                location: location.trim() || null,
                notes: notes.trim() || null,
            });

            setIsDone(true);
            onScheduled?.({
                messagesSent: result.messagesSent,
                shortlistedCount: result.shortlistedCount,
            });

            show({
                title: "Interviews scheduled",
                description:
                    result.shortlistedCount === 0
                        ? "No shortlisted candidates yet. Shortlist applicants first, then schedule again."
                        : `Interview details were sent to ${result.messagesSent} shortlisted candidate(s) in Messages.`,
                variant: result.messagesSent > 0 ? "success" : "warning",
            });

            setTimeout(() => handleClose(), 1800);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Please try again.";
            show({
                title: "Could not schedule interviews",
                description: message,
                variant: "error",
            });
        } finally {
            setIsSending(false);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {isDone ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Interview details sent</h3>
                        <p className="text-slate-500">
                            Shortlisted candidates for {jobTitle} were notified in chat.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#6C5DD3]" />
                                    Schedule interviews
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{jobTitle}</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={handleClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <p className="text-sm text-slate-600 bg-indigo-50/80 border border-indigo-100 rounded-xl p-3">
                            All shortlisted candidates will receive this invitation in Messages. Exact interview times
                            may differ per candidate — confirm each time in chat.
                        </p>

                        <div className="space-y-2">
                            <Label>Interview date</Label>
                            <Input
                                required
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    min={15}
                                    max={480}
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Format</Label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#6C5DD3] outline-none"
                                >
                                    <option value="Online">Online</option>
                                    <option value="Onsite">Onsite</option>
                                    <option value="Phone">Phone</option>
                                </select>
                            </div>
                        </div>

                        {mode === "Online" && (
                            <div className="space-y-2">
                                <Label>Meeting link (optional)</Label>
                                <Input
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        )}

                        {mode === "Onsite" && (
                            <div className="space-y-2">
                                <Label>Location (optional)</Label>
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Office address"
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Notes for candidates (optional)</Label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any extra details for shortlisted students..."
                                className="w-full min-h-[80px] p-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#6C5DD3] outline-none"
                            />
                        </div>

                        <Button type="submit" disabled={isSending} className="w-full">
                            {isSending ? "Sending to shortlisted candidates..." : "Notify shortlisted candidates"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

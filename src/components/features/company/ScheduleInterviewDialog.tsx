"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

function emptyDateRow() {
    return "";
}

export default function ScheduleInterviewDialog({
    open,
    onOpenChange,
    opportunityId,
    jobTitle,
    onScheduled,
}: ScheduleInterviewDialogProps) {
    const { show } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [hasExistingPlan, setHasExistingPlan] = useState(false);
    const [shortlistedCount, setShortlistedCount] = useState(0);
    const [multipleDates, setMultipleDates] = useState(false);
    const [tentativeDates, setTentativeDates] = useState<string[]>([emptyDateRow()]);
    const [durationMinutes, setDurationMinutes] = useState("60");
    const [mode, setMode] = useState("Online");
    const [meetingLink, setMeetingLink] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [notifyShortlisted, setNotifyShortlisted] = useState(true);

    const resetForm = () => {
        setTentativeDates([emptyDateRow()]);
        setMultipleDates(false);
        setDurationMinutes("60");
        setMode("Online");
        setMeetingLink("");
        setLocation("");
        setNotes("");
        setHasExistingPlan(false);
        setShortlistedCount(0);
        setNotifyShortlisted(true);
        setIsDone(false);
    };

    useEffect(() => {
        if (!open) return;

        const loadPlan = async () => {
            setIsLoadingPlan(true);
            try {
                const token = await AuthService.getIdToken();
                if (!token) return;

                const plan = await DashboardService.getInterviewPlan(token, opportunityId);
                if (!plan) {
                    resetForm();
                    return;
                }

                setHasExistingPlan(true);
                setShortlistedCount(plan.shortlistedCount);
                setTentativeDates(
                    plan.tentativeDates.length > 0 ? plan.tentativeDates : [emptyDateRow()]
                );
                setMultipleDates(plan.tentativeDates.length > 1);
                setDurationMinutes(String(plan.durationMinutes));
                setMode(plan.mode);
                setMeetingLink(plan.meetingLink || "");
                setLocation(plan.location || "");
                setNotes(plan.notes || "");
            } catch {
                resetForm();
            } finally {
                setIsLoadingPlan(false);
            }
        };

        void loadPlan();
    }, [open, opportunityId]);

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const updateDate = (index: number, value: string) => {
        setTentativeDates((prev) => prev.map((d, i) => (i === index ? value : d)));
    };

    const addDateRow = () => {
        setTentativeDates((prev) => [...prev, emptyDateRow()]);
        setMultipleDates(true);
    };

    const removeDateRow = (index: number) => {
        setTentativeDates((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length > 0 ? next : [emptyDateRow()];
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const filledDates = tentativeDates.filter((d) => d.trim());
        if (filledDates.length === 0) {
            show({
                title: "Date required",
                description: "Add at least one interview date.",
                variant: "warning",
            });
            return;
        }

        const calendarDates: string[] = [];
        for (const dateStr of filledDates) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                show({
                    title: "Invalid date",
                    description: "Please pick dates using the calendar control.",
                    variant: "warning",
                });
                return;
            }
            calendarDates.push(dateStr);
        }

        setIsSending(true);

        try {
            const token = await AuthService.getIdToken();
            if (!token) {
                throw new Error("Please sign in again.");
            }

            const result = await DashboardService.scheduleInterviews(token, opportunityId, {
                tentativeDates: calendarDates,
                durationMinutes: Number.parseInt(durationMinutes, 10) || 60,
                mode,
                meetingLink: meetingLink.trim() || null,
                location: location.trim() || null,
                notes: notes.trim() || null,
                notifyExistingShortlisted: notifyShortlisted,
            });

            setIsDone(true);
            setHasExistingPlan(true);
            setShortlistedCount(result.shortlistedCount);
            onScheduled?.({
                messagesSent: result.messagesSent,
                shortlistedCount: result.shortlistedCount,
            });

            let description: string;
            if (result.shortlistedCount === 0) {
                description =
                    "Interview plan saved. When you shortlist applicants, they will automatically receive these dates in Messages.";
            } else if (result.messagesSent > 0) {
                description = `Plan updated and sent to ${result.messagesSent} shortlisted candidate(s) in Messages.`;
            } else if (!notifyShortlisted) {
                description = "Interview plan saved. Shortlisted candidates were not notified yet.";
            } else {
                description = "Interview plan saved. Shortlisted candidates already have the latest details.";
            }

            show({
                title: hasExistingPlan ? "Interview plan updated" : "Interview plan saved",
                description,
                variant: "success",
            });

            setTimeout(() => handleClose(), 2000);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Please try again.";
            show({
                title: "Could not save interview plan",
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

    const showMultiple = multipleDates || tentativeDates.length > 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {isDone ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Interview plan saved</h3>
                        <p className="text-slate-500">
                            {shortlistedCount > 0
                                ? `Shortlisted candidates for ${jobTitle} were notified when applicable.`
                                : `New shortlists for ${jobTitle} will receive this plan automatically.`}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#6C5DD3]" />
                                    {hasExistingPlan ? "Edit interview plan" : "Set interview plan"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{jobTitle}</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={handleClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {isLoadingPlan ? (
                            <p className="text-sm text-slate-500">Loading saved plan...</p>
                        ) : (
                            <>
                                <p className="text-sm text-slate-600 bg-indigo-50/80 border border-indigo-100 rounded-xl p-3">
                                    One plan per job post. Save dates in advance — when you shortlist someone,
                                    they receive all tentative dates in Messages. Edit anytime; notify shortlisted
                                    candidates when you update.
                                </p>

                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                                    <Checkbox
                                        id="multiple-dates"
                                        checked={showMultiple}
                                        onCheckedChange={(checked) => {
                                            const enabled = Boolean(checked);
                                            setMultipleDates(enabled);
                                            if (enabled && tentativeDates.length === 1) {
                                                setTentativeDates([tentativeDates[0], emptyDateRow()]);
                                            }
                                            if (!enabled) {
                                                setTentativeDates([tentativeDates[0] || emptyDateRow()]);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="multiple-dates" className="cursor-pointer text-sm font-medium text-slate-700">
                                        Multiple tentative dates (for many applicants)
                                    </Label>
                                </div>

                                <div className="space-y-3">
                                    <Label>
                                        {showMultiple ? "Tentative interview dates" : "Interview date"}
                                    </Label>
                                    {tentativeDates.map((date, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                required={index === 0}
                                                type="date"
                                                value={date}
                                                onChange={(e) => updateDate(index, e.target.value)}
                                                className="h-12 flex-1 rounded-xl"
                                            />
                                            {showMultiple && tentativeDates.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="shrink-0 text-slate-400 hover:text-red-600"
                                                    onClick={() => removeDateRow(index)}
                                                    aria-label="Remove date"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {showMultiple && tentativeDates.length < 10 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={addDateRow}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add another date
                                        </Button>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Dates use the picker value (year-month-day). Today is{" "}
                                        {new Date().toLocaleDateString("en-LK", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                        .
                                    </p>
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

                                {shortlistedCount > 0 && (
                                    <div className="flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                                        <Checkbox
                                            id="notify-shortlisted"
                                            checked={notifyShortlisted}
                                            onCheckedChange={(checked) => setNotifyShortlisted(Boolean(checked))}
                                        />
                                        <Label
                                            htmlFor="notify-shortlisted"
                                            className="cursor-pointer text-sm leading-snug text-slate-600"
                                        >
                                            Notify {shortlistedCount} shortlisted candidate
                                            {shortlistedCount === 1 ? "" : "s"} now with this plan
                                        </Label>
                                    </div>
                                )}

                                <Button type="submit" disabled={isSending} className="w-full">
                                    {isSending
                                        ? "Saving..."
                                        : hasExistingPlan
                                          ? notifyShortlisted && shortlistedCount > 0
                                              ? "Update plan & notify shortlisted"
                                              : "Update interview plan"
                                          : shortlistedCount > 0
                                            ? "Save plan & notify shortlisted"
                                            : "Save interview plan"}
                                </Button>
                            </>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { API_ENDPOINTS } from "@/lib/config";

type SendOfferButtonProps = {
    candidateName: string;
    studentProfileId?: string;
    existingConversationId?: string | null;
};

export default function SendOfferButton({ candidateName, studentProfileId, existingConversationId }: SendOfferButtonProps) {
    const { show } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [proposalMessage, setProposalMessage] = useState("");
    const [salary, setSalary] = useState("");
    const [jobType, setJobType] = useState("Full-time");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!jobPosition.trim() || !proposalMessage.trim()) {
            show({
                title: "Missing required fields",
                description: "Please provide a job position and proposal message.",
                variant: "warning",
            });
            return;
        }

        setIsSending(true);

        try {
            const token = await AuthService.getIdToken();
            if (!token) {
                throw new Error("Please sign in again to send the offer.");
            }

            if (!studentProfileId) {
                throw new Error("Student reference missing. Open from candidate profile and try again.");
            }

            // Create job offer application
            const offerResponse = await fetch(API_ENDPOINTS.APPLICATIONS.CREATE_JOB_OFFER, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentProfileId,
                    jobTitle: jobPosition.trim(),
                    jobType,
                    compensation: salary.trim() || null,
                    proposalMessage: proposalMessage.trim()
                })
            });

            if (!offerResponse.ok) {
                throw new Error("Failed to create job offer application");
            }

            // Also send as chat message
            let conversationId = existingConversationId || null;
            if (!conversationId) {
                const created = await DashboardService.startConversation(token, { studentProfileId });
                conversationId = created.id;
            }

            const formattedOfferMessage = `JOB_OFFER::${JSON.stringify({
                position: jobPosition.trim(),
                jobType,
                compensation: salary.trim() || null,
                message: proposalMessage.trim(),
                note: "Please reply in this chat if you are interested.",
            })}`;

            await DashboardService.sendConversationMessage(token, conversationId, formattedOfferMessage);

            setIsSending(false);
            setIsSent(true);
            show({
                title: "Proposal Sent!",
                description: `Your job offer has been sent to ${candidateName} and appears in their applications.`,
                variant: "success",
            });

            setJobPosition("");
            setProposalMessage("");
            setSalary("");
            setJobType("Full-time");

            setTimeout(() => {
                setIsOpen(false);
                setIsSent(false);
            }, 2000);
        } catch (error: any) {
            setIsSending(false);
            show({
                title: "Failed to send offer",
                description: error?.message || "Please try again.",
                variant: "error",
            });
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
            >
                <Send className="w-4 h-4 mr-2" /> Send Job Offer
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        {isSent ? (
                            <div className="p-12 text-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">Proposal Sent Successfully!</h3>
                                <p className="text-slate-500">The student has been notified and the offer is visible in chat.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Job Offer Proposal</h3>
                                        <p className="text-sm text-slate-500">Send an interest proposal to {candidateName}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Job Position</Label>
                                        <Input
                                            required
                                            value={jobPosition}
                                            onChange={(event) => setJobPosition(event.target.value)}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Proposal Message</Label>
                                        <textarea
                                            required
                                            value={proposalMessage}
                                            onChange={(event) => setProposalMessage(event.target.value)}
                                            placeholder={`Write a message to ${candidateName} explaining why you're interested...`}
                                            className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#6C5DD3] focus:border-transparent transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Expected Salary (Optional)</Label>
                                            <Input
                                                value={salary}
                                                onChange={(event) => setSalary(event.target.value)}
                                                placeholder="e.g. LKR 150,000 - 180,000"
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Job Type</Label>
                                            <select
                                                value={jobType}
                                                onChange={(event) => setJobType(event.target.value)}
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#6C5DD3] outline-none"
                                            >
                                                <option>Full-time</option>
                                                <option>Contract</option>
                                                <option>Internship</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSending}
                                        className="w-full"
                                    >
                                        {isSending ? "Sending Proposal..." : "Send Proposal"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

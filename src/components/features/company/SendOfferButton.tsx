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
import { JobPositionPicker } from "@/components/shared/JobPositionPicker";
import {
  appendJobCategoryToDescription,
  buildPostedJobTitle,
  isOtherJobCategory,
} from "@/lib/constants/job-positions";
import { cn } from "@/lib/utils";

type SendOfferButtonProps = {
  candidateName: string;
  studentProfileId?: string;
  existingConversationId?: string | null;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
};

const INITIAL_FORM = {
  jobCategoryId: "",
  jobPosition: "",
  otherPositionName: "",
  otherPositionDetails: "",
  proposalMessage: "",
  salary: "",
  jobType: "Full-time",
};

export default function SendOfferButton({
  candidateName,
  studentProfileId,
  existingConversationId,
  className,
  size = "default",
}: SendOfferButtonProps) {
  const { show } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [jobCategoryId, setJobCategoryId] = useState(INITIAL_FORM.jobCategoryId);
  const [jobPosition, setJobPosition] = useState(INITIAL_FORM.jobPosition);
  const [otherPositionName, setOtherPositionName] = useState(INITIAL_FORM.otherPositionName);
  const [otherPositionDetails, setOtherPositionDetails] = useState(INITIAL_FORM.otherPositionDetails);
  const [proposalMessage, setProposalMessage] = useState(INITIAL_FORM.proposalMessage);
  const [salary, setSalary] = useState(INITIAL_FORM.salary);
  const [jobType, setJobType] = useState(INITIAL_FORM.jobType);

  const resetForm = () => {
    setJobCategoryId(INITIAL_FORM.jobCategoryId);
    setJobPosition(INITIAL_FORM.jobPosition);
    setOtherPositionName(INITIAL_FORM.otherPositionName);
    setOtherPositionDetails(INITIAL_FORM.otherPositionDetails);
    setProposalMessage(INITIAL_FORM.proposalMessage);
    setSalary(INITIAL_FORM.salary);
    setJobType(INITIAL_FORM.jobType);
  };

  const openModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jobTitle = buildPostedJobTitle(jobCategoryId, jobPosition, otherPositionName);

    if (!jobCategoryId) {
      show({
        title: "Missing category",
        description: "Select a job category.",
        variant: "warning",
      });
      return;
    }

    if (isOtherJobCategory(jobCategoryId)) {
      if (!otherPositionName.trim() || !otherPositionDetails.trim()) {
        show({
          title: "Missing custom role",
          description: "Enter a position name and role details for Other.",
          variant: "warning",
        });
        return;
      }
    } else if (!jobPosition.trim()) {
      show({
        title: "Missing position",
        description: "Select a job position.",
        variant: "warning",
      });
      return;
    }

    if (!proposalMessage.trim()) {
      show({
        title: "Missing message",
        description: "Please provide a proposal message.",
        variant: "warning",
      });
      return;
    }

    const proposalText = appendJobCategoryToDescription(
      proposalMessage.trim(),
      jobCategoryId,
      otherPositionDetails
    );

    setIsSending(true);

    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        throw new Error("Please sign in again to send the offer.");
      }

      if (!studentProfileId) {
        throw new Error("Student reference missing. Open from candidate profile and try again.");
      }

      const offerResponse = await fetch(API_ENDPOINTS.APPLICATIONS.CREATE_JOB_OFFER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentProfileId,
          jobTitle,
          jobType,
          compensation: salary.trim() || null,
          proposalMessage: proposalText,
        }),
      });

      if (!offerResponse.ok) {
        const errBody = await offerResponse.json().catch(() => ({}));
        const message =
          (errBody as { message?: string }).message ||
          (errBody as { detail?: string }).detail ||
          "Failed to create job offer application";
        throw new Error(message);
      }

      const offerApplication = (await offerResponse.json()) as { id: string };

      let conversationId = existingConversationId || null;
      if (!conversationId) {
        const created = await DashboardService.startConversation(token, { studentProfileId });
        conversationId = created.id;
      }

      const formattedOfferMessage = `JOB_OFFER::${JSON.stringify({
        applicationId: offerApplication.id,
        position: jobTitle,
        jobType,
        compensation: salary.trim() || null,
        message: proposalText,
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

      resetForm();

      setTimeout(() => {
        setIsOpen(false);
        setIsSent(false);
      }, 2000);
    } catch (error: unknown) {
      setIsSending(false);
      show({
        title: "Failed to send offer",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <>
      <Button onClick={openModal} size={size} className={cn("w-full justify-center whitespace-nowrap", className)}>
        <Send className="mr-2 h-4 w-4 shrink-0" />
        Send Job Offer
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {isSent ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Proposal Sent Successfully!</h3>
                <p className="text-slate-500">The student has been notified and the offer is visible in chat.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="p-8 pb-4 space-y-6 overflow-y-auto flex-1">
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

                  <JobPositionPicker
                    categoryId={jobCategoryId}
                    position={jobPosition}
                    otherPositionName={otherPositionName}
                    otherPositionDetails={otherPositionDetails}
                    onCategoryChange={setJobCategoryId}
                    onPositionChange={setJobPosition}
                    onOtherPositionNameChange={setOtherPositionName}
                    onOtherPositionDetailsChange={setOtherPositionDetails}
                    categoryLabel="Job category"
                    positionLabel="Job position"
                  />

                  <div className="space-y-2">
                    <Label>Proposal Message *</Label>
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

                <div className="p-8 pt-4 border-t border-slate-100 shrink-0">
                  <Button type="submit" disabled={isSending} className="w-full">
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

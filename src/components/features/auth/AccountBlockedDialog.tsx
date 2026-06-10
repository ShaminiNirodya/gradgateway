"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ACCOUNT_BLOCKED_MESSAGE } from "@/lib/utils/account-blocked";
import { SupportService } from "@/lib/services/support.service";
import { useToast } from "@/components/ui/toast";
import type { UserRole } from "@/lib/types/auth";

type AccountBlockedDialogProps = {
  email?: string;
  displayName?: string | null;
  role?: UserRole;
  message?: string;
  pulse?: boolean;
  onSignOut: () => void;
};

export function AccountBlockedDialog({
  email,
  displayName,
  role = "Student",
  message = ACCOUNT_BLOCKED_MESSAGE,
  pulse = false,
  onSignOut,
}: AccountBlockedDialogProps) {
  const { show } = useToast();
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMessage, setSupportMessage] = useState(
    "My account has been blocked. I would like to request a review."
  );
  const [sending, setSending] = useState(false);

  const submitSupport = async () => {
    if (!email?.trim()) {
      show({
        title: "Email required",
        description: "We could not detect your email. Please sign out and try again.",
        variant: "error",
      });
      return;
    }

    setSending(true);
    try {
      await SupportService.submitInquiry({
        name: displayName?.trim() || email,
        email,
        type: "Support",
        message: supportMessage.trim(),
        submitterRole: role,
      });
      show({
        title: "Message sent",
        description: "Our team received your support request and will follow up by email.",
        variant: "success",
      });
      setShowSupportForm(false);
    } catch (error) {
      show({
        title: "Could not send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      data-account-blocked-action
      className={cn(
        "w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-transform",
        pulse && "animate-[shake_0.45s_ease-in-out]"
      )}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="account-blocked-title"
      aria-describedby="account-blocked-description"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <ShieldOff className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 id="account-blocked-title" className="text-lg font-bold text-slate-900">
            Account blocked
          </h2>
          <p id="account-blocked-description" className="mt-2 text-sm leading-relaxed text-slate-600">
            {message}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            You cannot use GradGateway until an admin unblocks your account. You can still contact
            support below.
          </p>
        </div>
      </div>

      {showSupportForm ? (
        <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contact support
          </p>
          <Input value={email ?? ""} readOnly className="rounded-xl bg-white" />
          <textarea
            value={supportMessage}
            onChange={(event) => setSupportMessage(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/30"
            placeholder="Describe your issue…"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setShowSupportForm(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
              onClick={() => void submitSupport()}
              disabled={sending || !supportMessage.trim()}
            >
              {sending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowSupportForm(true)}
          >
            Contact support
          </Button>
          <Button
            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
            onClick={() => void onSignOut()}
          >
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}

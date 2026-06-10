"use client";

import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { CompanyProfile } from "@/lib/types/company";

export function CompanyVerificationBanner({ company }: { company: CompanyProfile | null }) {
  if (!company?.verificationStatus) return null;

  const status = company.verificationStatus;

  if (status === "Approved") return null;

  if (status === "Pending") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Verification pending</p>
          <p className="mt-0.5 text-amber-800/90">
            An administrator must approve your company before new job posts go live for students.
            You can still prepare drafts in the meantime.
          </p>
        </div>
      </div>
    );
  }

  if (status === "Rejected") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <p className="font-semibold">Company verification rejected</p>
          {company.verificationRejectionReason && (
            <p className="mt-1 text-red-800">{company.verificationRejectionReason}</p>
          )}
          <p className="mt-2 text-red-800/90">
            Update your profile in{" "}
            <Link href="/dashboard/company/settings" className="font-semibold underline">
              settings
            </Link>{" "}
            and contact support if you need a re-review.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

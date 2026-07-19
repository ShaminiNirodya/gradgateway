"use client";

import { Button } from "@/components/ui/button";
import { SupportInquiryListItem } from "@/lib/types/admin";
import { inferSubmitterRole } from "@/lib/utils/support-inquiry";
import { X } from "lucide-react";

export function AdminInquiryDetailModal({
  inquiry,
  onClose,
  onMarkReviewed,
  onDelete,
}: {
  inquiry: SupportInquiryListItem;
  onClose: () => void;
  onMarkReviewed: () => void;
  onDelete: () => void;
}) {
  const role = inferSubmitterRole(inquiry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{inquiry.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {inquiry.email}
              {inquiry.phone ? ` · ${inquiry.phone}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {inquiry.inquiryType}
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {role}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              inquiry.status === "Open"
                ? "bg-amber-50 text-amber-800"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {inquiry.status}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Received {new Date(inquiry.createdAt).toLocaleString()}
          {inquiry.reviewedAt
            ? ` · Reviewed ${new Date(inquiry.reviewedAt).toLocaleString()}`
            : ""}
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Message</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{inquiry.message}</p>
        </div>

        {inquiry.attachmentName && (
          <p className="mt-4 text-sm text-slate-500">Attachment: {inquiry.attachmentName}</p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onDelete}>
            Delete
          </Button>
          {inquiry.status === "Open" && (
            <Button className="rounded-xl" onClick={onMarkReviewed}>
              Mark reviewed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

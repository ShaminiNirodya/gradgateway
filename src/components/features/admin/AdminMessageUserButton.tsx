"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminMessageUserButtonProps = {
  studentProfileId?: string | null;
  companyProfileId?: string | null;
  disabled?: boolean;
};

export function AdminMessageUserButton({
  studentProfileId,
  companyProfileId,
  disabled = false,
}: AdminMessageUserButtonProps) {
  if (!studentProfileId && !companyProfileId) {
    return null;
  }

  const href = studentProfileId
    ? `/dashboard/admin/messages?studentProfileId=${studentProfileId}`
    : `/dashboard/admin/messages?companyProfileId=${companyProfileId}`;

  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="rounded-lg"
      disabled={disabled}
    >
      <Link href={href}>
        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
        Message
      </Link>
    </Button>
  );
}

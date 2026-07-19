import { SupportInquiryListItem } from '@/lib/types/admin';

export function inferSubmitterRole(inquiry: SupportInquiryListItem): string {
  if (inquiry.submitterRole) return inquiry.submitterRole;
  if (inquiry.message.includes('[Student')) return 'Student';
  if (inquiry.message.includes('[Company')) return 'Company';
  return 'Public';
}

export function inquiryPreview(message: string, max = 120): string {
  const clean = message.replace(/\s*\[(Student|Company|Public)[^\]]*\]\s*$/, '').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

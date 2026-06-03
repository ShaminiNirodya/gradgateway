export interface CompanyRegistration {
  email: string;
  firebaseUid: string;
  companyName: string;
  companyEmail: string;
  phone: string;
  website?: string | null;
  industry: string;
  logoDataUrl?: string | null;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  position: string;
}

export interface CompanyProfile {
  email: string;
  firebaseUid: string;
  companyName: string;
  companyEmail: string;
  phone: string;
  website?: string | null;
  industry: string;
  logoDataUrl?: string | null;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  position: string;
}

export interface CompanyPublicOpening {
  id: string;
  title: string;
  location: string;
  opportunityType: string;
  workMode: string;
  deadlineAt: string;
  monthlyStipendLkr?: number | null;
  createdAt: string;
}

export interface CompanyPublicProfile {
  id: string;
  companyName: string;
  companyEmail: string;
  phone: string;
  website?: string | null;
  industry: string;
  logoDataUrl?: string | null;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  position: string;
  activeOpeningsCount: number;
  openings: CompanyPublicOpening[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Pending' | 'Active' | 'Removed';
  invitedAt: string;
  acceptedAt?: string | null;
}

export interface InviteTeamMemberPayload {
  name: string;
  email: string;
  role: string;
}

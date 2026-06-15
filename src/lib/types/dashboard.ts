export interface OpportunityItem {
  id: string;
  companyProfileId: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  description: string;
  opportunityType: string;
  workMode: string;
  location: string;
  requiredSkills: string;
  monthlyStipendLkr?: number;
  deadlineAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApplicationItem {
  id: string;
  opportunityId?: string | null;
  /** Set when the company sent a job offer (not a student-initiated opening apply). */
  companyProfileId?: string | null;
  studentProfileId: string;
  jobTitle: string;
  companyName: string;
  studentName: string;
  studentEmail: string;
  coverLetter?: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

export interface ConversationItem {
  id: string;
  opportunityId?: string;
  otherPartyName: string;
  otherPartyPhotoUrl?: string;
  lastMessage: string;
  lastMessageAt: string;
  hasUnread?: boolean;
  kind?: string;
  supportTargetRole?: string | null;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  relatedOpportunityId?: string | null;
  relatedApplicationId?: string | null;
  relatedConversationId?: string | null;
  relatedStudentProfileId?: string | null;
}

export interface ScheduleInterviewsResult {
  opportunityId: string;
  jobTitle: string;
  shortlistedCount: number;
  messagesSent: number;
  interviewsScheduled: number;
  planSaved?: boolean;
}

export interface OpportunityInterviewPlan {
  opportunityId: string;
  tentativeDates: string[];
  durationMinutes: number;
  mode: string;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
  updatedAt?: string | null;
  shortlistedCount: number;
}

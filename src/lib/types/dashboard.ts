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
  opportunityId: string;
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
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  relatedOpportunityId?: string | null;
}

export interface ScheduleInterviewsResult {
  opportunityId: string;
  jobTitle: string;
  shortlistedCount: number;
  messagesSent: number;
  interviewsScheduled: number;
}

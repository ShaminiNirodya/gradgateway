export interface AdminDashboard {
  totalStudents: number;
  totalCompanies: number;
  totalProjects: number;
  hiringRate: number;
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  studentAccounts: number;
  companyAccounts: number;
  adminAccounts: number;
  totalApplications: number;
  hiredApplications: number;
  signupsLast7Days: number;
  activeJobPosts: number;
  expiredJobPosts: number;
  openSupportInquiries: number;
  totalSupportInquiries: number;
  pendingTestimonials: number;
}

export interface SupportInquiryListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  inquiryType: string;
  message: string;
  attachmentName?: string | null;
  submitterRole?: string | null;
  status: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  displayName?: string | null;
  studentProfileId?: string | null;
  companyProfileId?: string | null;
  studentUniversity?: string | null;
  studentDegree?: string | null;
}

export interface AdminCompanyListItem {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  industry: string;
  createdAt: string;
  activeJobCount: number;
  userEmail: string;
  userIsActive: boolean;
}

export interface AdminPlatformSettings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface AdminAnalytics {
  totalStudents: number;
  totalCompanies: number;
  totalApplications: number;
  hiredApplications: number;
  activeJobPosts: number;
  signupsLast7Days: number;
  openSupportInquiries: number;
  pendingTestimonials: number;
  publishedTestimonials: number;
  hiringRate: number;
  signupsByWeek: { label: string; value: number; date: string }[];
  applicationsByWeek: { label: string; value: number; date: string }[];
  applicationsByStatus: { label: string; value: number }[];
  topIndustries: { label: string; value: number }[];
}

export interface PublicPlatformSettings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

export interface AdminEmailLogItem {
  id: string;
  userEmail: string;
  toEmail: string;
  templateType: string;
  purpose: string;
  provider: string;
  status: string;
  error?: string | null;
  createdAt: string;
  sentAt?: string | null;
}

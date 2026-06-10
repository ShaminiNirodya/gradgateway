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
  pendingCompanyVerifications: number;
  approvedCompanies: number;
  rejectedCompanies: number;
  totalApplications: number;
  hiredApplications: number;
  signupsLast7Days: number;
  activeJobPosts: number;
  expiredJobPosts: number;
  openSupportInquiries: number;
  totalSupportInquiries: number;
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
  verificationStatus: string;
  verificationRejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  activeJobCount: number;
  userEmail: string;
  userIsActive: boolean;
}

export interface AdminPlatformSettings {
  allowRegistration: boolean;
  requireCompanyVerification: boolean;
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface PublicPlatformSettings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

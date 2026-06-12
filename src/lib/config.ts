export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5160';

export const API_ENDPOINTS = {
  AUTH: {
    SYNC: `${API_URL}/api/auth/sync`,
    ME: `${API_URL}/api/auth/me`,
    HEALTH: `${API_URL}/api/auth/health`,
    FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
    VERIFY_RESET_CODE: `${API_URL}/api/auth/verify-reset-code`,
    RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,
  },
  STUDENTS: {
    REGISTER: `${API_URL}/api/students/register`,
    ME: `${API_URL}/api/students/me`,
    DIRECTORY: `${API_URL}/api/students/directory`,
    DIRECTORY_ENTRY: (studentProfileId: string) =>
      `${API_URL}/api/students/${studentProfileId}/directory-entry`,
    PROJECTS: (studentProfileId: string) =>
      `${API_URL}/api/students/${studentProfileId}/projects`,
  },
  COMPANIES: {
    REGISTER: `${API_URL}/api/companies/register`,
    ME: `${API_URL}/api/companies/me`,
    PUBLIC: (companyProfileId: string) =>
      `${API_URL}/api/companies/public/${companyProfileId}`,
    PUBLIC_LEGACY: (companyProfileId: string) =>
      `${API_URL}/api/companies/${companyProfileId}/public`,
  },
  OPPORTUNITIES: {
    LIST: `${API_URL}/api/opportunities`,
    EXPIRED_COUNT: `${API_URL}/api/opportunities/expired-count`,
    BY_ID: (id: string) => `${API_URL}/api/opportunities/${id}`,
    COMPANY_PROFILE: (opportunityId: string) =>
      `${API_URL}/api/opportunities/${opportunityId}/company-profile`,
    COMPANY_ME: `${API_URL}/api/opportunities/company/me`,
    CREATE: `${API_URL}/api/opportunities`,
    UPDATE: (id: string) => `${API_URL}/api/opportunities/${id}`,
    CLOSE: (id: string) => `${API_URL}/api/opportunities/${id}/close`,
    DELETE: (id: string) => `${API_URL}/api/opportunities/${id}`,
    SCHEDULE_INTERVIEWS: (id: string) => `${API_URL}/api/opportunities/${id}/schedule-interviews`,
    INTERVIEW_PLAN: (id: string) => `${API_URL}/api/opportunities/${id}/interview-plan`,
  },
  INTERVIEWS: {
    STUDENT_ME: `${API_URL}/api/interviews/student/me`,
  },
  SKILLS: {
    ME: `${API_URL}/api/students/me/skills`,
    DELETE: (skillId: string) => `${API_URL}/api/students/me/skills/${skillId}`,
  },
  APPLICATIONS: {
    APPLY: `${API_URL}/api/applications/apply`,
    RESPOND_JOB_OFFER: (conversationId: string) =>
      `${API_URL}/api/applications/conversation/${conversationId}/offer-response`,
    STUDENT_ME: `${API_URL}/api/applications/student/me`,
    SYNC_OFFER_REPLIES: `${API_URL}/api/applications/student/sync-offer-replies`,
    COMPANY_ME: `${API_URL}/api/applications/company/me`,
    COMPANY_ANALYTICS: `${API_URL}/api/applications/company/analytics`,
    UPDATE_STATUS: (id: string) => `${API_URL}/api/applications/${id}/status`,
    CREATE_JOB_OFFER: `${API_URL}/api/applications/job-offer`,
  },
  CONVERSATIONS: {
    START: `${API_URL}/api/conversations/start`,
    ME: `${API_URL}/api/conversations/me`,
    MESSAGES: (id: string) => `${API_URL}/api/conversations/${id}/messages`,
  },
  PROJECTS: {
    BY_ID: (id: string) => `${API_URL}/api/projects/${id}`,
    ME: `${API_URL}/api/projects/me`,
    ME_BY_ID: (id: string) => `${API_URL}/api/projects/me/${id}`,
    BY_STUDENT: (studentProfileId: string) =>
      `${API_URL}/api/projects/student/${studentProfileId}`,
    DELETE: (id: string) => `${API_URL}/api/projects/${id}`,
  },
  NOTIFICATIONS: {
    ME: `${API_URL}/api/notifications/me`,
    MARK_READ: (id: string) => `${API_URL}/api/notifications/${id}/read`,
  },
  EMAIL_LOGS: {
    TRACK: `${API_URL}/api/emaillogs/track`,
    ME: `${API_URL}/api/emaillogs/me`,
  },
  PLATFORM_STATS: `${API_URL}/api/platformstats`,
  PLATFORM: {
    SETTINGS: `${API_URL}/api/platform/settings`,
  },
  SUPPORT_INQUIRIES: `${API_URL}/api/supportinquiries`,
  ADMIN: {
    DASHBOARD: `${API_URL}/api/admin/dashboard`,
    USERS: `${API_URL}/api/admin/users`,
    USER_ACTIVE: (userId: string) => `${API_URL}/api/admin/users/${userId}/active`,
    USER_REMOVE: (userId: string) => `${API_URL}/api/admin/users/${userId}`,
    COMPANIES: `${API_URL}/api/admin/companies`,
    INQUIRIES: `${API_URL}/api/admin/inquiries`,
    INQUIRY_REVIEWED: (inquiryId: string) => `${API_URL}/api/admin/inquiries/${inquiryId}/reviewed`,
    INQUIRY_DELETE: (inquiryId: string) => `${API_URL}/api/admin/inquiries/${inquiryId}`,
    SETTINGS: `${API_URL}/api/admin/settings`,
    EMAIL_LOGS: `${API_URL}/api/admin/email-logs`,
  },
} as const;

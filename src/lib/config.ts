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
  },
  COMPANIES: {
    REGISTER: `${API_URL}/api/companies/register`,
    ME: `${API_URL}/api/companies/me`,
  },
  COMPANY_TEAM: {
    ME: `${API_URL}/api/companyteam/me`,
    INVITE: `${API_URL}/api/companyteam/invite`,
    REMOVE: (memberId: string) => `${API_URL}/api/companyteam/${memberId}/remove`,
    ACCEPT: `${API_URL}/api/companyteam/accept`,
  },
  OPPORTUNITIES: {
    LIST: `${API_URL}/api/opportunities`,
    BY_ID: (id: string) => `${API_URL}/api/opportunities/${id}`,
    COMPANY_ME: `${API_URL}/api/opportunities/company/me`,
    CREATE: `${API_URL}/api/opportunities`,
    SCHEDULE_INTERVIEWS: (id: string) => `${API_URL}/api/opportunities/${id}/schedule-interviews`,
  },
  APPLICATIONS: {
    APPLY: `${API_URL}/api/applications/apply`,
    STUDENT_ME: `${API_URL}/api/applications/student/me`,
    COMPANY_ME: `${API_URL}/api/applications/company/me`,
    UPDATE_STATUS: (id: string) => `${API_URL}/api/applications/${id}/status`,
    CREATE_JOB_OFFER: `${API_URL}/api/applications/job-offer`,
  },
  CONVERSATIONS: {
    START: `${API_URL}/api/conversations/start`,
    ME: `${API_URL}/api/conversations/me`,
    MESSAGES: (id: string) => `${API_URL}/api/conversations/${id}/messages`,
  },
  PROJECTS: {
    ME: `${API_URL}/api/projects/me`,
    ME_BY_ID: (id: string) => `${API_URL}/api/projects/me/${id}`,
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
} as const;

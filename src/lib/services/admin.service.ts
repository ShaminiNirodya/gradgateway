import { API_ENDPOINTS } from '@/lib/config';
import {
  AdminAnalytics,
  AdminCompanyListItem,
  AdminDashboard,
  AdminEmailLogItem,
  AdminPlatformSettings,
  AdminUserListItem,
  PublicPlatformSettings,
  SupportInquiryListItem,
} from '@/lib/types/admin';
import {
  AdminCreateTestimonialPayload,
  AdminUpdateTestimonialPayload,
  TestimonialListItem,
} from '@/lib/types/testimonial';
import { unwrapPagedItems, type PagedResult } from '@/lib/types/paged';

async function getJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.title || `${fallbackMessage} (${response.status})`);
  }
  return response.json();
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export class AdminService {
  static async getDashboard(token: string): Promise<AdminDashboard> {
    const response = await fetch(API_ENDPOINTS.ADMIN.DASHBOARD, {
      headers: authHeaders(token),
    });
    const data = await getJsonOrThrow<Record<string, unknown>>(response, 'Failed to load admin dashboard');

    return {
      totalStudents: Number(data.totalStudents ?? data.TotalStudents ?? 0),
      totalCompanies: Number(data.totalCompanies ?? data.TotalCompanies ?? 0),
      totalProjects: Number(data.totalProjects ?? data.TotalProjects ?? 0),
      hiringRate: Number(data.hiringRate ?? data.HiringRate ?? 0),
      totalUsers: Number(data.totalUsers ?? data.TotalUsers ?? 0),
      activeUsers: Number(data.activeUsers ?? data.ActiveUsers ?? 0),
      suspendedUsers: Number(data.suspendedUsers ?? data.SuspendedUsers ?? 0),
      studentAccounts: Number(data.studentAccounts ?? data.StudentAccounts ?? 0),
      companyAccounts: Number(data.companyAccounts ?? data.CompanyAccounts ?? 0),
      adminAccounts: Number(data.adminAccounts ?? data.AdminAccounts ?? 0),
      totalApplications: Number(data.totalApplications ?? data.TotalApplications ?? 0),
      hiredApplications: Number(data.hiredApplications ?? data.HiredApplications ?? 0),
      signupsLast7Days: Number(data.signupsLast7Days ?? data.SignupsLast7Days ?? 0),
      activeJobPosts: Number(data.activeJobPosts ?? data.ActiveJobPosts ?? 0),
      expiredJobPosts: Number(data.expiredJobPosts ?? data.ExpiredJobPosts ?? 0),
      openSupportInquiries: Number(data.openSupportInquiries ?? data.OpenSupportInquiries ?? 0),
      totalSupportInquiries: Number(data.totalSupportInquiries ?? data.TotalSupportInquiries ?? 0),
      pendingTestimonials: Number(data.pendingTestimonials ?? data.PendingTestimonials ?? 0),
    };
  }

  static async getAnalytics(token: string): Promise<AdminAnalytics> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ANALYTICS, {
      headers: authHeaders(token),
    });
    const data = await getJsonOrThrow<Record<string, unknown>>(response, 'Failed to load admin analytics');

    const mapPoints = (camel: string, pascal: string) => {
      const raw = (data[camel] ?? data[pascal]) as
        | { label: string; value: number; date?: string }[]
        | undefined;
      return (raw ?? []).map((point) => ({
        label: point.label,
        value: point.value,
        date: point.date ?? "",
      }));
    };

    const mapCounts = (camel: string, pascal: string) => {
      const raw = (data[camel] ?? data[pascal]) as { label: string; value: number }[] | undefined;
      return raw ?? [];
    };

    return {
      totalStudents: Number(data.totalStudents ?? data.TotalStudents ?? 0),
      totalCompanies: Number(data.totalCompanies ?? data.TotalCompanies ?? 0),
      totalApplications: Number(data.totalApplications ?? data.TotalApplications ?? 0),
      hiredApplications: Number(data.hiredApplications ?? data.HiredApplications ?? 0),
      activeJobPosts: Number(data.activeJobPosts ?? data.ActiveJobPosts ?? 0),
      signupsLast7Days: Number(data.signupsLast7Days ?? data.SignupsLast7Days ?? 0),
      openSupportInquiries: Number(data.openSupportInquiries ?? data.OpenSupportInquiries ?? 0),
      pendingTestimonials: Number(data.pendingTestimonials ?? data.PendingTestimonials ?? 0),
      publishedTestimonials: Number(data.publishedTestimonials ?? data.PublishedTestimonials ?? 0),
      hiringRate: Number(data.hiringRate ?? data.HiringRate ?? 0),
      signupsByWeek: mapPoints('signupsByWeek', 'SignupsByWeek'),
      applicationsByWeek: mapPoints('applicationsByWeek', 'ApplicationsByWeek'),
      applicationsByStatus: mapCounts('applicationsByStatus', 'ApplicationsByStatus'),
      topIndustries: mapCounts('topIndustries', 'TopIndustries'),
    };
  }

  static async getUsers(
    token: string,
    params?: { role?: string; search?: string; activeOnly?: boolean }
  ): Promise<AdminUserListItem[]> {
    const qs = new URLSearchParams();
    if (params?.role) qs.set('role', params.role);
    if (params?.search) qs.set('search', params.search);
    if (params?.activeOnly !== undefined) qs.set('activeOnly', String(params.activeOnly));

    const url = qs.toString()
      ? `${API_ENDPOINTS.ADMIN.USERS}?${qs}`
      : API_ENDPOINTS.ADMIN.USERS;

    const response = await fetch(url, { headers: authHeaders(token) });
    const data = await getJsonOrThrow<PagedResult<AdminUserListItem> | AdminUserListItem[]>(
      response,
      'Failed to load users'
    );
    return unwrapPagedItems(data);
  }

  static async setUserActive(token: string, userId: string, isActive: boolean): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.USER_ACTIVE(userId), {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ isActive }),
    });
    await getJsonOrThrow(response, 'Failed to update user status');
  }

  static async getCompanies(
    token: string,
    params?: { status?: string; search?: string }
  ): Promise<AdminCompanyListItem[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);

    const url = qs.toString()
      ? `${API_ENDPOINTS.ADMIN.COMPANIES}?${qs}`
      : API_ENDPOINTS.ADMIN.COMPANIES;

    const response = await fetch(url, { headers: authHeaders(token) });
    const data = await getJsonOrThrow<PagedResult<AdminCompanyListItem> | AdminCompanyListItem[]>(
      response,
      'Failed to load companies'
    );
    return unwrapPagedItems(data);
  }

  static async removeUser(token: string, userId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.USER_REMOVE(userId), {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to remove user');
  }

  static async getInquiries(
    token: string,
    params?: { status?: string; inquiryType?: string; submitterRole?: string }
  ): Promise<SupportInquiryListItem[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.inquiryType) qs.set('inquiryType', params.inquiryType);
    if (params?.submitterRole) qs.set('submitterRole', params.submitterRole);

    const url = qs.toString()
      ? `${API_ENDPOINTS.ADMIN.INQUIRIES}?${qs}`
      : API_ENDPOINTS.ADMIN.INQUIRIES;
    const response = await fetch(url, { headers: authHeaders(token) });
    const data = await getJsonOrThrow<PagedResult<SupportInquiryListItem> | SupportInquiryListItem[]>(
      response,
      'Failed to load inquiries'
    );
    return unwrapPagedItems(data);
  }

  static async deleteInquiry(token: string, inquiryId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.INQUIRY_DELETE(inquiryId), {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to delete inquiry');
  }

  static async markInquiryReviewed(token: string, inquiryId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.INQUIRY_REVIEWED(inquiryId), {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to update inquiry');
  }

  static async getEmailLogs(
    token: string,
    params?: { search?: string; status?: string; take?: number }
  ): Promise<AdminEmailLogItem[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.take) qs.set('take', String(params.take));

    const url = qs.toString()
      ? `${API_ENDPOINTS.ADMIN.EMAIL_LOGS}?${qs}`
      : API_ENDPOINTS.ADMIN.EMAIL_LOGS;
    const response = await fetch(url, { headers: authHeaders(token) });
    const data = await getJsonOrThrow<PagedResult<AdminEmailLogItem> | AdminEmailLogItem[]>(
      response,
      'Failed to load email logs'
    );
    return unwrapPagedItems(data);
  }

  static async getSettings(token: string): Promise<AdminPlatformSettings> {
    const response = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
      headers: authHeaders(token),
    });
    return getJsonOrThrow(response, 'Failed to load platform settings');
  }

  static async updateSettings(
    token: string,
    settings: Omit<AdminPlatformSettings, 'updatedAt'>
  ): Promise<AdminPlatformSettings> {
    const response = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(settings),
    });
    return getJsonOrThrow(response, 'Failed to save platform settings');
  }

  static async getPublicSettings(): Promise<PublicPlatformSettings> {
    const response = await fetch(API_ENDPOINTS.PLATFORM.SETTINGS, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return { allowRegistration: true, maintenanceMode: false };
    }
    return response.json();
  }

  static async getTestimonials(
    token: string,
    params?: { status?: string }
  ): Promise<TestimonialListItem[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);

    const url = qs.toString()
      ? `${API_ENDPOINTS.ADMIN.TESTIMONIALS}?${qs}`
      : API_ENDPOINTS.ADMIN.TESTIMONIALS;

    const response = await fetch(url, { headers: authHeaders(token) });
    const data = await getJsonOrThrow<PagedResult<TestimonialListItem> | TestimonialListItem[]>(
      response,
      'Failed to load testimonials'
    );
    return unwrapPagedItems(data);
  }

  static async createTestimonial(
    token: string,
    payload: AdminCreateTestimonialPayload
  ): Promise<TestimonialListItem> {
    const response = await fetch(API_ENDPOINTS.ADMIN.TESTIMONIALS, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return getJsonOrThrow(response, 'Failed to create testimonial');
  }

  static async updateTestimonial(
    token: string,
    id: string,
    payload: AdminUpdateTestimonialPayload
  ): Promise<TestimonialListItem> {
    const response = await fetch(API_ENDPOINTS.ADMIN.TESTIMONIAL(id), {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return getJsonOrThrow(response, 'Failed to update testimonial');
  }

  static async setTestimonialStatus(
    token: string,
    id: string,
    status: string
  ): Promise<TestimonialListItem> {
    const response = await fetch(API_ENDPOINTS.ADMIN.TESTIMONIAL_STATUS(id), {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
    return getJsonOrThrow(response, 'Failed to update testimonial status');
  }

  static async deleteTestimonial(token: string, id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.TESTIMONIAL(id), {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to delete testimonial');
  }
}

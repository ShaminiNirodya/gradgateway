import { API_ENDPOINTS } from '@/lib/config';
import {
  AdminCompanyListItem,
  AdminDashboard,
  AdminEmailLogItem,
  AdminPlatformSettings,
  AdminUserListItem,
  PublicPlatformSettings,
  SupportInquiryListItem,
} from '@/lib/types/admin';
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
    return getJsonOrThrow(response, 'Failed to load admin dashboard');
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
}

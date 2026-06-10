import { API_ENDPOINTS } from '@/lib/config';
import {
  AdminCompanyListItem,
  AdminDashboard,
  AdminPlatformSettings,
  AdminUserListItem,
  PublicPlatformSettings,
  SupportInquiryListItem,
} from '@/lib/types/admin';

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
    return getJsonOrThrow(response, 'Failed to load users');
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
    return getJsonOrThrow(response, 'Failed to load companies');
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
    status?: string
  ): Promise<SupportInquiryListItem[]> {
    const url = status
      ? `${API_ENDPOINTS.ADMIN.INQUIRIES}?status=${encodeURIComponent(status)}`
      : API_ENDPOINTS.ADMIN.INQUIRIES;
    const response = await fetch(url, { headers: authHeaders(token) });
    return getJsonOrThrow(response, 'Failed to load inquiries');
  }

  static async markInquiryReviewed(token: string, inquiryId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.INQUIRY_REVIEWED(inquiryId), {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to update inquiry');
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
    const response = await fetch(API_ENDPOINTS.ADMIN.SETTINGS_PUBLIC);
    if (!response.ok) {
      return { allowRegistration: true, maintenanceMode: false };
    }
    return response.json();
  }
}

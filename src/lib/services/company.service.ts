import { API_ENDPOINTS } from '@/lib/config';
import { CompanyRegistration, CompanyProfile } from '@/lib/types/company';

export class CompanyService {
  static async registerCompany(token: string, payload: CompanyRegistration): Promise<CompanyProfile> {
    const response = await fetch(API_ENDPOINTS.COMPANIES.REGISTER, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to register company');
    }

    return response.json();
  }

  static async getCurrentCompany(token: string): Promise<CompanyProfile> {
    const response = await fetch(API_ENDPOINTS.COMPANIES.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch company profile');
    }

    return response.json();
  }
}

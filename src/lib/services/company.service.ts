import { API_ENDPOINTS } from '@/lib/config';
import { CompanyRegistration, CompanyProfile, CompanyPublicProfile } from '@/lib/types/company';

async function getJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      (error as { message?: string })?.message ||
      (error as { title?: string })?.title ||
      `${fallbackMessage} (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

function normalizePublicProfile(raw: Record<string, unknown>): CompanyPublicProfile {
  const openingsRaw = (raw.openings ?? raw.Openings ?? []) as Record<string, unknown>[];

  return {
    id: String(raw.id ?? raw.Id ?? ''),
    companyName: String(raw.companyName ?? raw.CompanyName ?? ''),
    companyEmail: String(raw.companyEmail ?? raw.CompanyEmail ?? ''),
    phone: String(raw.phone ?? raw.Phone ?? ''),
    website: (raw.website ?? raw.Website ?? null) as string | null,
    industry: String(raw.industry ?? raw.Industry ?? ''),
    logoDataUrl: (raw.logoDataUrl ?? raw.LogoDataUrl ?? null) as string | null,
    recruiterName: String(raw.recruiterName ?? raw.RecruiterName ?? ''),
    recruiterEmail: String(raw.recruiterEmail ?? raw.RecruiterEmail ?? ''),
    recruiterPhone: String(raw.recruiterPhone ?? raw.RecruiterPhone ?? ''),
    position: String(raw.position ?? raw.Position ?? ''),
    activeOpeningsCount: Number(raw.activeOpeningsCount ?? raw.ActiveOpeningsCount ?? 0),
    openings: openingsRaw.map((o) => ({
      id: String(o.id ?? o.Id ?? ''),
      title: String(o.title ?? o.Title ?? ''),
      location: String(o.location ?? o.Location ?? ''),
      opportunityType: String(o.opportunityType ?? o.OpportunityType ?? ''),
      workMode: String(o.workMode ?? o.WorkMode ?? ''),
      deadlineAt: String(o.deadlineAt ?? o.DeadlineAt ?? ''),
      monthlyStipendLkr: (o.monthlyStipendLkr ?? o.MonthlyStipendLkr ?? null) as number | null,
      createdAt: String(o.createdAt ?? o.CreatedAt ?? ''),
    })),
  };
}

async function fetchPublicProfile(url: string, token: string): Promise<CompanyPublicProfile> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await getJsonOrThrow<Record<string, unknown>>(response, 'Failed to fetch company profile');
  return normalizePublicProfile(data);
}

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

  static async getPublicCompanyProfile(
    token: string,
    companyProfileId: string
  ): Promise<CompanyPublicProfile> {
    const urls = [
      API_ENDPOINTS.COMPANIES.PUBLIC(companyProfileId),
      API_ENDPOINTS.COMPANIES.PUBLIC_LEGACY(companyProfileId),
    ];

    let lastError: Error | null = null;
    for (const url of urls) {
      try {
        return await fetchPublicProfile(url, token);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Failed to fetch company profile');
      }
    }

    throw lastError ?? new Error('Failed to fetch company profile');
  }

  static async getPublicCompanyProfileByOpportunity(
    token: string,
    opportunityId: string
  ): Promise<CompanyPublicProfile> {
    return fetchPublicProfile(API_ENDPOINTS.OPPORTUNITIES.COMPANY_PROFILE(opportunityId), token);
  }
}

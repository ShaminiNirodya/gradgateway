import { API_ENDPOINTS } from '@/lib/config';
import type {
  CatalogDegreeAdmin,
  CatalogUniversityAdmin,
  CatalogUniversityDetail,
  PublicAcademicCatalog,
  UpsertCatalogDegreePayload,
  UpsertCatalogUniversityPayload,
} from '@/lib/types/academic-catalog';
import {
  ALL_DEGREES,
  ALL_UNIVERSITIES,
  UNIVERSITY_DEGREE_MAPPINGS,
} from '@/lib/constants/university-degrees';
import { buildUniversityDegreeMap } from '@/lib/types/academic-catalog';

let cachedCatalog: PublicAcademicCatalog | null = null;
let cachePromise: Promise<PublicAcademicCatalog> | null = null;

function fallbackCatalog(): PublicAcademicCatalog {
  return {
    universities: ALL_UNIVERSITIES.map((name) => ({
      id: name,
      name,
      degrees: UNIVERSITY_DEGREE_MAPPINGS[name] ?? [],
    })),
    degrees: [...ALL_DEGREES],
  };
}

function normalizePublicCatalog(data: Record<string, unknown>): PublicAcademicCatalog {
  const universitiesRaw = (data.universities ?? data.Universities) as unknown[] | undefined;
  const degreesRaw = (data.degrees ?? data.Degrees) as unknown[] | undefined;

  const universities = Array.isArray(universitiesRaw)
    ? universitiesRaw.map((row) => {
        const item = row as Record<string, unknown>;
        const degrees = (item.degrees ?? item.Degrees) as unknown;
        return {
          id: String(item.id ?? item.Id ?? ''),
          name: String(item.name ?? item.Name ?? ''),
          degrees: Array.isArray(degrees) ? degrees.map(String) : [],
        };
      })
    : [];

  const degrees = Array.isArray(degreesRaw) ? degreesRaw.map(String) : [];

  return { universities, degrees };
}

export class AcademicCatalogService {
  static async getPublicCatalog(forceRefresh = false): Promise<PublicAcademicCatalog> {
    if (!forceRefresh && cachedCatalog) {
      return cachedCatalog;
    }

    if (!forceRefresh && cachePromise) {
      return cachePromise;
    }

    cachePromise = (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PLATFORM.ACADEMIC_CATALOG, {
          next: { revalidate: 120 },
        });
        if (!response.ok) {
          throw new Error('Failed to load academic catalog');
        }
        const data = normalizePublicCatalog(await response.json());
        if (data.universities.length === 0) {
          cachedCatalog = fallbackCatalog();
        } else {
          cachedCatalog = data;
        }
        return cachedCatalog;
      } catch {
        cachedCatalog = fallbackCatalog();
        return cachedCatalog;
      } finally {
        cachePromise = null;
      }
    })();

    return cachePromise;
  }

  static getUniversityDegreeMap(catalog: PublicAcademicCatalog): Record<string, string[]> {
    return buildUniversityDegreeMap(catalog);
  }

  static clearCache(): void {
    cachedCatalog = null;
    cachePromise = null;
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function getJsonOrThrow<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message || message);
  }
  return response.json();
}

function mapUniversityAdmin(row: Record<string, unknown>): CatalogUniversityAdmin {
  return {
    id: String(row.id ?? row.Id ?? ''),
    name: String(row.name ?? row.Name ?? ''),
    isActive: Boolean(row.isActive ?? row.IsActive ?? true),
    sortOrder: Number(row.sortOrder ?? row.SortOrder ?? 0),
    degreeCount: Number(row.degreeCount ?? row.DegreeCount ?? 0),
    updatedAt: String(row.updatedAt ?? row.UpdatedAt ?? ''),
  };
}

function mapDegreeAdmin(row: Record<string, unknown>): CatalogDegreeAdmin {
  return {
    id: String(row.id ?? row.Id ?? ''),
    name: String(row.name ?? row.Name ?? ''),
    isActive: Boolean(row.isActive ?? row.IsActive ?? true),
    sortOrder: Number(row.sortOrder ?? row.SortOrder ?? 0),
    universityCount: Number(row.universityCount ?? row.UniversityCount ?? 0),
    updatedAt: String(row.updatedAt ?? row.UpdatedAt ?? ''),
  };
}

function mapUniversityDetail(row: Record<string, unknown>): CatalogUniversityDetail {
  const degreesRaw = (row.degrees ?? row.Degrees) as unknown[] | undefined;
  return {
    id: String(row.id ?? row.Id ?? ''),
    name: String(row.name ?? row.Name ?? ''),
    isActive: Boolean(row.isActive ?? row.IsActive ?? true),
    sortOrder: Number(row.sortOrder ?? row.SortOrder ?? 0),
    updatedAt: String(row.updatedAt ?? row.UpdatedAt ?? ''),
    degrees: Array.isArray(degreesRaw)
      ? degreesRaw.map((d) => {
          const item = d as Record<string, unknown>;
          return {
            id: String(item.id ?? item.Id ?? ''),
            name: String(item.name ?? item.Name ?? ''),
            isActive: Boolean(item.isActive ?? item.IsActive ?? true),
            offeringIsActive: Boolean(item.offeringIsActive ?? item.OfferingIsActive ?? true),
          };
        })
      : [],
  };
}

export class AdminAcademicCatalogService {
  static async getUniversities(token: string, includeHidden = true): Promise<CatalogUniversityAdmin[]> {
    const qs = includeHidden ? '?includeHidden=true' : '';
    const response = await fetch(`${API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITIES}${qs}`, {
      headers: authHeaders(token),
    });
    const data = await getJsonOrThrow<Record<string, unknown>[]>(
      response,
      'Failed to load universities'
    );
    return data.map((row) => mapUniversityAdmin(row));
  }

  static async getUniversity(token: string, id: string): Promise<CatalogUniversityDetail> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITY(id), {
      headers: authHeaders(token),
    });
    const data = await getJsonOrThrow<Record<string, unknown>>(
      response,
      'Failed to load university'
    );
    return mapUniversityDetail(data);
  }

  static async createUniversity(
    token: string,
    payload: UpsertCatalogUniversityPayload
  ): Promise<CatalogUniversityAdmin> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITIES, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return mapUniversityAdmin(await getJsonOrThrow(response, 'Failed to create university'));
  }

  static async updateUniversity(
    token: string,
    id: string,
    payload: UpsertCatalogUniversityPayload
  ): Promise<CatalogUniversityAdmin> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITY(id), {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return mapUniversityAdmin(await getJsonOrThrow(response, 'Failed to update university'));
  }

  static async setUniversityActive(token: string, id: string, isActive: boolean): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITY_ACTIVE(id), {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ isActive }),
    });
    await getJsonOrThrow(response, 'Failed to update university visibility');
  }

  static async setUniversityDegrees(token: string, id: string, degreeIds: string[]): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITY_DEGREES(id), {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ degreeIds }),
    });
    await getJsonOrThrow(response, 'Failed to update university degrees');
  }

  static async deleteUniversity(token: string, id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_UNIVERSITY(id), {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to delete university');
  }

  static async getDegrees(token: string, includeHidden = true): Promise<CatalogDegreeAdmin[]> {
    const qs = includeHidden ? '?includeHidden=true' : '';
    const response = await fetch(`${API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_DEGREES}${qs}`, {
      headers: authHeaders(token),
    });
    const data = await getJsonOrThrow<Record<string, unknown>[]>(response, 'Failed to load degrees');
    return data.map((row) => mapDegreeAdmin(row));
  }

  static async createDegree(
    token: string,
    payload: UpsertCatalogDegreePayload
  ): Promise<CatalogDegreeAdmin> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_DEGREES, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return mapDegreeAdmin(await getJsonOrThrow(response, 'Failed to create degree'));
  }

  static async updateDegree(
    token: string,
    id: string,
    payload: UpsertCatalogDegreePayload
  ): Promise<CatalogDegreeAdmin> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_DEGREE(id), {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return mapDegreeAdmin(await getJsonOrThrow(response, 'Failed to update degree'));
  }

  static async setDegreeActive(token: string, id: string, isActive: boolean): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_DEGREE_ACTIVE(id), {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ isActive }),
    });
    await getJsonOrThrow(response, 'Failed to update degree visibility');
  }

  static async deleteDegree(token: string, id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.ADMIN.ACADEMIC_CATALOG_DEGREE(id), {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    await getJsonOrThrow(response, 'Failed to delete degree');
  }
}

import { API_ENDPOINTS } from '@/lib/config';
import { StudentRegistration, StudentProfile } from '@/lib/types/student';
import { normalizePagedResult, type PagedResult } from '@/lib/types/paged';

export type StudentDirectoryItem = {
  studentProfileId: string;
  fullName: string;
  university: string;
  degree: string;
  fieldOfMajor: string;
  gradYear: number;
  currentYear: number;
  gpa: number;
  email: string;
  skills: string;
  photoDataUrl?: string;
  availability: string;
  cvUrl?: string;
};

export type StudentDirectorySearchParams = {
  q?: string;
  universities?: string[];
  degrees?: string[];
  gradYear?: number;
  gpaMin?: number;
  gpaMax?: number;
  skills?: string[];
  availability?: string[];
  sort?: 'Relevance' | 'GPA' | 'Class';
  page?: number;
  pageSize?: number;
};

export class StudentService {
  static async registerStudent(token: string, payload: StudentRegistration): Promise<StudentProfile> {
    try {
      const response = await fetch(API_ENDPOINTS.STUDENTS.REGISTER, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const firstValidationError =
          error?.errors && typeof error.errors === 'object'
            ? Object.values(error.errors).flat()[0]
            : undefined;

        throw new Error(
          error.message ||
          error.title ||
          firstValidationError ||
          `Student registration failed (${response.status}).`
        );
      }

      return response.json();
    } catch (error: any) {
      if (error?.message) {
        throw error;
      }

      throw new Error('Unable to reach server. Please make sure the API is running and try again.');
    }
  }

  static async getCurrentStudent(token: string): Promise<StudentProfile> {
    const response = await fetch(API_ENDPOINTS.STUDENTS.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch student profile');
    }

    return response.json();
  }

  static async searchStudentDirectory(
    token: string,
    params: StudentDirectorySearchParams = {}
  ): Promise<PagedResult<StudentDirectoryItem>> {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set('q', params.q.trim());
    if (params.universities?.length) qs.set('universities', params.universities.join(','));
    if (params.degrees?.length) qs.set('degrees', params.degrees.join(','));
    if (params.gradYear != null && params.gradYear > 0) qs.set('gradYear', String(params.gradYear));
    if (params.gpaMin != null && !Number.isNaN(params.gpaMin)) qs.set('gpaMin', String(params.gpaMin));
    if (params.gpaMax != null && !Number.isNaN(params.gpaMax)) qs.set('gpaMax', String(params.gpaMax));
    if (params.skills?.length) qs.set('skills', params.skills.join(','));
    if (params.availability?.length) qs.set('availability', params.availability.join(','));
    if (params.sort) qs.set('sort', params.sort);
    if (params.page != null) qs.set('page', String(params.page));
    if (params.pageSize != null) qs.set('pageSize', String(params.pageSize));

    const url = qs.toString()
      ? `${API_ENDPOINTS.STUDENTS.DIRECTORY}?${qs}`
      : API_ENDPOINTS.STUDENTS.DIRECTORY;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch student directory');
    }

    const data = await response.json();
    return normalizePagedResult(mapPagedDirectoryResponse(data), params.pageSize ?? 20);
  }

  /** @deprecated Prefer searchStudentDirectory for paginated results. */
  static async getStudentDirectory(token: string, query?: string): Promise<StudentDirectoryItem[]> {
    const result = await this.searchStudentDirectory(token, {
      q: query,
      page: 1,
      pageSize: 100,
    });
    return result.items;
  }

  static async getStudentDirectoryEntry(
    token: string,
    studentProfileId: string
  ): Promise<StudentDirectoryItem | null> {
    const response = await fetch(API_ENDPOINTS.STUDENTS.DIRECTORY_ENTRY(studentProfileId), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch student profile');
    }

    const row = await response.json();
    return mapDirectoryRow(row as Record<string, unknown>);
  }

  static async getMySkills(token: string): Promise<StudentSkillItem[]> {
    const response = await fetch(API_ENDPOINTS.SKILLS.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to load skills');
    }

    return response.json();
  }

  static async addSkill(token: string, name: string): Promise<StudentSkillItem> {
    const response = await fetch(API_ENDPOINTS.SKILLS.ME, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to add skill');
    }

    return response.json();
  }

  static async removeSkill(token: string, studentSkillId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.SKILLS.DELETE(studentSkillId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to remove skill');
    }
  }

  static async getMyInterviews(token: string): Promise<StudentInterviewItem[]> {
    const response = await fetch(API_ENDPOINTS.INTERVIEWS.STUDENT_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to load interviews');
    }

    return response.json();
  }
}

export interface StudentSkillItem {
  id: string;
  name: string;
  category: string;
  proficiencyLevel: string;
}

export interface StudentInterviewItem {
  id: string;
  scheduledAt: string;
  mode: string;
  meetingLink?: string | null;
  location?: string | null;
  status: string;
  notes?: string | null;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string | null;
}

function mapDirectoryRow(row: Record<string, unknown>): StudentDirectoryItem {
    return ({
      studentProfileId: String(row.studentProfileId ?? row.StudentProfileId ?? ''),
      fullName: String(row.fullName ?? row.FullName ?? ''),
      university: String(row.university ?? row.University ?? ''),
      degree: String(row.degree ?? row.Degree ?? ''),
      fieldOfMajor: String(row.fieldOfMajor ?? row.FieldOfMajor ?? ''),
      gradYear: Number(row.gradYear ?? row.GradYear ?? 0),
      currentYear: Number(row.currentYear ?? row.CurrentYear ?? 0),
      gpa: Number(row.gpa ?? row.Gpa ?? 0),
      email: String(row.email ?? row.Email ?? ''),
      skills: String(row.skills ?? row.Skills ?? ''),
      photoDataUrl: (row.photoDataUrl ?? row.PhotoDataUrl) as string | undefined,
      availability: String(row.availability ?? row.Availability ?? ''),
      cvUrl: (row.cvUrl ?? row.CvUrl) as string | undefined,
    });
}

function mapPagedDirectoryResponse(data: unknown): StudentDirectoryItem[] | PagedResult<StudentDirectoryItem> {
  if (Array.isArray(data)) {
    return data.map((row) => mapDirectoryRow(row as Record<string, unknown>));
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const rawItems = (record.items ?? record.Items) as unknown[] | undefined;
    if (Array.isArray(rawItems)) {
      const items = rawItems.map((row) => mapDirectoryRow(row as Record<string, unknown>));
      return {
        items,
        totalCount: Number(record.totalCount ?? record.TotalCount ?? items.length),
        page: Number(record.page ?? record.Page ?? 1),
        pageSize: Number(record.pageSize ?? record.PageSize ?? (items.length || 20)),
        totalPages: Number(record.totalPages ?? record.TotalPages ?? 0),
        hasNextPage: Boolean(record.hasNextPage ?? record.HasNextPage ?? false),
        hasPreviousPage: Boolean(record.hasPreviousPage ?? record.HasPreviousPage ?? false),
      };
    }
  }

  return [];
}

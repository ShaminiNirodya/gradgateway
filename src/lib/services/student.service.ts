import { API_ENDPOINTS } from '@/lib/config';
import { StudentRegistration, StudentProfile } from '@/lib/types/student';

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

  static async getStudentDirectory(token: string, query?: string): Promise<Array<{
    studentProfileId: string;
    fullName: string;
    university: string;
    degree: string;
    fieldOfMajor: string;
    gradYear: number;
    gpa: number;
    email: string;
    skills: string;
  }>> {
    const url = query?.trim()
      ? `${API_ENDPOINTS.STUDENTS.DIRECTORY}?q=${encodeURIComponent(query.trim())}`
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

    const rows = await response.json();
    if (!Array.isArray(rows)) return [];

    return rows.map((row: Record<string, unknown>) => ({
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
    }));
  }
}

import { API_ENDPOINTS } from '@/lib/config';
import { ProjectItem } from '@/lib/types/project';

async function getJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.title || `${fallbackMessage} (${response.status})`);
  }

  return response.json();
}

export class ProjectService {
  static async getMyProjects(token: string): Promise<ProjectItem[]> {
    const response = await fetch(API_ENDPOINTS.PROJECTS.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return getJsonOrThrow<ProjectItem[]>(response, 'Failed to load projects');
  }

  static async getMyProjectById(token: string, id: string): Promise<ProjectItem> {
    const response = await fetch(API_ENDPOINTS.PROJECTS.ME_BY_ID(id), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return getJsonOrThrow<ProjectItem>(response, 'Failed to load project');
  }

  static async deleteProject(token: string, id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.PROJECTS.DELETE(id), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || error?.title || `Failed to delete project (${response.status})`);
    }
  }

  static async getStudentProjects(token: string, studentProfileId: string): Promise<ProjectItem[]> {
    const id = studentProfileId?.trim();
    if (!id) {
      return [];
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const primary = await fetch(API_ENDPOINTS.STUDENTS.PROJECTS(id), { headers });
    if (primary.ok) {
      return primary.json() as Promise<ProjectItem[]>;
    }

    const fallback = await fetch(API_ENDPOINTS.PROJECTS.BY_STUDENT(id), { headers });
    return getJsonOrThrow<ProjectItem[]>(fallback, 'Failed to load student projects');
  }
}

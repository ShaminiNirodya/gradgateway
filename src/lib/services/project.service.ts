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
}

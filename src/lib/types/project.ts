export interface ProjectItem {
  id: string;
  studentProfileId: string;
  studentName: string;
  title: string;
  description: string;
  techStack: string;
  repositoryUrl?: string | null;
  demoUrl?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

"use client";

import {
  Search,
  Calendar,
  Download,
  Plus,
  Globe,
  Github,
  Trash2,
  FolderOpen,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { ProjectService } from "@/lib/services/project.service";
import { ProjectItem } from "@/lib/types/project";
import { useStudentProfile } from "@/lib/hooks/useStudentProfile";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";

export default function StudentProjectsPortfolio() {
  const { show } = useToast();
  const { profile, displayName, initials } = useStudentProfile();
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setProjects([]);
          return;
        }

        const rows = await ProjectService.getMyProjects(token);
        setProjects(rows);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const term = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.techStack.toLowerCase().includes(term)
    );
  }, [projects, search]);

  const fileStamp = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Updated today";
    } else if (diffDays === 1) {
      return "Updated yesterday";
    } else if (diffDays < 7) {
      return `Updated ${diffDays} days ago`;
    } else {
      return `Updated ${date.toLocaleDateString("en-LK")}`;
    }
  };

  const handleDelete = async (projectId: string) => {
    setDeleting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        show({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "error",
          duration: 3000
        });
        return;
      }

      await ProjectService.deleteProject(token, projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      show({
        title: "Project deleted",
        description: "The project has been removed from your portfolio.",
        variant: "success",
        duration: 3000
      });
      setDeleteConfirm(null);
    } catch (error: any) {
      show({
        title: "Delete failed",
        description: error.message || "Could not delete the project.",
        variant: "error",
        duration: 3000
      });
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    if (filteredProjects.length === 0) {
      show({ title: "No data", description: "No projects to export", variant: "error" });
      return;
    }

    // CSV headers
    const headers = ["Title", "Description", "Tech Stack", "Repository URL", "Demo URL", "Is Public", "Created At", "Updated At"];
    
    // CSV rows
    const rows = filteredProjects.map(project => [
      project.title,
      project.description.replace(/,/g, ";"), // Replace commas to avoid CSV issues
      project.techStack,
      project.repositoryUrl || "",
      project.demoUrl || "",
      project.isPublic ? "Yes" : "No",
      new Date(project.createdAt).toLocaleDateString("en-LK"),
      new Date(project.updatedAt).toLocaleDateString("en-LK")
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-${fileStamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show({ title: "Exported", description: "Projects saved as CSV", variant: "success" });
  };

  return (
    <StudentPageContainer>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5b4eb8] via-[#6C5DD3] to-[#8a7cff] p-6 text-white shadow-lg sm:p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0 border-2 border-white/30 shadow-md sm:h-16 sm:w-16">
              <AvatarImage src={profile?.photoDataUrl} alt={displayName} />
              <AvatarFallback className="bg-white/20 text-lg font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Portfolio</p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My Project Portfolio</h1>
              <p className="mt-1 text-sm font-medium text-white/80">
                Showcase your work to recruiters and companies
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button
              asChild
              className="h-10 rounded-xl border-0 bg-white text-[#6C5DD3] shadow-md hover:bg-white/95"
            >
              <Link href="/dashboard/student/projects/new">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={exportCSV}
              className="h-10 rounded-xl border border-white/20 bg-white/15 text-white hover:bg-white/25"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by title, description, or tech stack..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white pl-12 text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:border-[#6C5DD3]/40 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-16 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C5DD3]" />
          <p className="text-sm font-bold text-slate-600">Loading your projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-[#6C5DD3]">
            <FolderOpen className="h-7 w-7" />
          </div>
          <p className="text-lg font-extrabold text-slate-800">No projects found</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {search.trim()
              ? "Try a different search term or clear the filter."
              : "Add your first project to start building your portfolio."}
          </p>
          {!search.trim() && (
            <Button asChild className="mt-6 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]">
              <Link href="/dashboard/student/projects/new">
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const skills = project.techStack
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 4);
            const hasImage = project.images && project.images.length > 0;

            return (
              <article
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C5DD3]/25 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  {hasImage ? (
                    <img
                      src={project.images![0].imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5b4eb8] via-[#6C5DD3] to-[#8a7cff]">
                      <span className="text-sm font-semibold text-white/70">No preview image</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900">
                      {project.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {project.description}
                    </p>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6C5DD3]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {project.repositoryUrl && (
                        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-1 h-3.5 w-3.5" /> Code
                          </a>
                        </Button>
                      )}
                      {project.demoUrl && (
                        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-1 h-3.5 w-3.5" /> Demo
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(project.id)}
                        className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="ml-auto h-8 rounded-lg bg-[#6C5DD3] text-xs hover:bg-[#5b4eb8]"
                      >
                        <Link href={`/dashboard/student/projects/${project.id}`}>
                          View <ExternalLink className="ml-1 h-3 w-3 opacity-80" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-center text-lg font-extrabold text-slate-900">Delete project?</h3>
            <p className="mb-6 mt-2 text-center text-sm text-slate-600">
              This cannot be undone. The project will be removed from your portfolio.
            </p>
            <div className="flex gap-3">
              <Button
                variant="soft"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StudentPageContainer>
  );
}


"use client";

import { Search, Calendar, Download, Plus, Globe, Github, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { ProjectService } from "@/lib/services/project.service";
import { ProjectItem } from "@/lib/types/project";
import { useStudentProfile } from "@/lib/hooks/useStudentProfile";

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

  const totalPublic = useMemo(
    () => projects.filter((project) => project.isPublic).length,
    [projects]
  );

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
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search projects by title, description, or tech stack..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-white border-none rounded-2xl h-14 pl-12 text-slate-600 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
        />
      </div>

      <div className="relative rounded-[30px] p-8 text-white overflow-hidden shadow-xl bg-gradient-to-br from-[#5b4eb8] via-[#6C5DD3] to-[#8a7cff]">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-4 border-white/20 shadow-lg">
              <AvatarImage src={profile?.photoDataUrl} alt={displayName} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold mb-2">My Project Portfolio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/dashboard/student/projects/new">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Link>
            </Button>
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          <StatCard label="Total Projects" value={projects.length} />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[24px] p-10 text-center shadow-sm">
          <p className="text-slate-700 font-bold">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-[24px] p-10 text-center shadow-sm">
          <p className="text-slate-700 font-bold">No projects found</p>
          <p className="text-slate-500 text-sm mt-1">Create a project or adjust your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const skills = project.techStack
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 4);

            return (
              <div key={project.id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                {/* Image Thumbnail */}
                {project.images && project.images.length > 0 ? (
                  <div className="w-full h-40 overflow-hidden bg-slate-100">
                    <img
                      src={project.images[0].imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-[#5b4eb8] via-[#6C5DD3] to-[#8a7cff] flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-60">No image</span>
                  </div>
                )}

                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{project.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">{project.description}</p>
                    </div>
                    {/* Removed Public/Private badge per request */}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.repositoryUrl && (
                        <Button asChild variant="outline" size="sm">
                          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-1" /> Code
                          </a>
                        </Button>
                      )}
                      {project.demoUrl && (
                        <Button asChild variant="outline" size="sm">
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-1" /> Demo
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeleteConfirm(project.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/dashboard/student/projects/${project.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Separator className="my-6" />
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-2">Need Help?</h4>
        <p className="text-xs text-slate-500">Contact support team</p>
        <Button asChild variant="secondary">
          <Link href="/help">Get Support</Link>
        </Button>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Project</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 rounded-2xl p-5">
      <p className="text-xs text-white/80 font-semibold">{label}</p>
      <h3 className="text-2xl font-extrabold tracking-tight">{value}</h3>
    </div>
  );
}

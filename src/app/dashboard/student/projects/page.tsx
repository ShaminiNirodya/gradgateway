"use client";

import { Search, Calendar, Download, Plus, Globe, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { ProjectService } from "@/lib/services/project.service";
import { ProjectItem } from "@/lib/types/project";

export default function StudentProjectsPortfolio() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredProjects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-${fileStamp()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show({ title: "Exported", description: "Projects saved as JSON", variant: "success" });
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
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold mb-2">My Project Portfolio</h1>
            <p className="text-indigo-100 max-w-md">All records come directly from your GradGateway database.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/dashboard/student/projects/new">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Link>
            </Button>
            <Button variant="secondary" onClick={exportJSON}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <StatCard label="Total Projects" value={projects.length} />
          <StatCard label="Visible to Recruiters" value={totalPublic} />
          <StatCard label="Filtered Results" value={filteredProjects.length} />
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
              <div key={project.id} className="bg-white rounded-[24px] shadow-sm p-6 border border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{project.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{project.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${project.isPublic ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString("en-LK")}</span>
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
                    <Button asChild size="sm">
                      <Link href={`/dashboard/student/projects/${project.id}`}>View</Link>
                    </Button>
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

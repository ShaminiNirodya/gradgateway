"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Github, Globe, Calendar, User, Lock, Globe2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { ProjectService } from "@/lib/services/project.service";
import { ProjectItem } from "@/lib/types/project";

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token || !id) {
          setProject(null);
          return;
        }

        const row = await ProjectService.getMyProjectById(token, id);
        setProject(row);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const techStack = useMemo(
    () =>
      (project?.techStack || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [project?.techStack]
  );

  const normalizedTitle = useMemo(() => {
    const raw = (project?.title || "").trim();
    if (!raw) return "Project Overview";

    return raw
      .split(/\s+/)
      .map((word) => {
        if (word.length <= 3 && word.toUpperCase() === word) return word;
        if (word.toLowerCase() === "ai") return "AI";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }, [project?.title]);

  const normalizedDescription = useMemo(() => {
    const raw = (project?.description || "").trim();
    if (!raw) {
      return "Production-grade portfolio project showcasing practical engineering skills and measurable outcomes.";
    }

    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [project?.description]);

  const ownerName = useMemo(() => {
    const raw = (project?.studentName || "").trim();
    if (!raw) return "Student";

    return raw
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, [project?.studentName]);

  const heroImage = useMemo(() => {
    const keywords = [
      techStack[0],
      techStack[1],
      normalizedTitle,
      "software project",
    ]
      .filter(Boolean)
      .join(",");

    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(keywords)}`;
  }, [normalizedTitle, techStack]);

  if (loading) {
    return <div className="bg-white rounded-2xl p-8 shadow-sm">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Project not found</h2>
        <Button asChild>
          <Link href="/dashboard/student/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild className="pl-0 group">
          <Link href="/dashboard/student/projects">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <img
              src={heroImage}
              alt={`${normalizedTitle} visual`}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          <div className="rounded-3xl p-8 bg-gradient-to-br from-[#5b4eb8] via-[#6C5DD3] to-[#8a7cff] text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              {project.isPublic ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span className="text-xs font-bold uppercase tracking-wider">{project.isPublic ? "Public project" : "Private project"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{normalizedTitle}</h1>
            <p className="mt-4 text-indigo-100 leading-relaxed">{normalizedDescription}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="font-bold text-xl text-slate-900 mb-5">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-100">
                  {tech}
                </span>
              ))}
              {techStack.length === 0 && <p className="text-sm text-slate-500">No technologies listed.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Project Links</h3>
              <div className="flex flex-col gap-3">
                <Button className="w-full justify-start h-12" asChild disabled={!project.repositoryUrl}>
                  <a href={project.repositoryUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-3" /> View Source Code
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild disabled={!project.demoUrl}>
                  <a href={project.demoUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-3" /> Project Demo
                  </a>
                </Button>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Details</h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[#6C5DD3]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Last Updated</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(project.updatedAt).toLocaleDateString("en-LK")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Owner</p>
                  <p className="text-sm font-bold text-slate-700">{ownerName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

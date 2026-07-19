"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Github,
  Globe,
  Calendar,
  User,
  Pencil,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { ProjectService } from "@/lib/services/project.service";
import { ProjectItem } from "@/lib/types/project";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";

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
    if (project?.images && project.images.length > 0) {
      return project.images[0].imageUrl;
    }

    const keywords = [techStack[0], techStack[1], normalizedTitle, "software project"]
      .filter(Boolean)
      .join(",");

    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(keywords)}`;
  }, [normalizedTitle, techStack, project?.images]);

  const updatedLabel = project
    ? new Date(project.updatedAt).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <StudentPageContainer>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-20 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C5DD3]" />
          <p className="text-sm font-bold text-slate-600">Loading project details...</p>
        </div>
      </StudentPageContainer>
    );
  }

  if (!project) {
    return (
      <StudentPageContainer>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <h2 className="font-serif text-xl font-extrabold text-slate-900">Project not found</h2>
          <p className="mt-2 text-sm text-slate-500">This project may have been removed or you do not have access.</p>
          <Button asChild variant="soft" className="mt-6">
            <Link href="/dashboard/student/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </StudentPageContainer>
    );
  }

  return (
    <StudentPageContainer className="pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="soft" asChild className="w-fit">
          <Link href="/dashboard/student/projects" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Projects
          </Link>
        </Button>
        <Button asChild className="rounded-xl bg-[#6C5DD3] shadow-md shadow-indigo-200/50 hover:bg-[#5b4eb8]">
          <Link href={`/dashboard/student/projects/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="relative">
              <img
                src={heroImage}
                alt=""
                className="h-56 w-full object-cover md:h-72"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="mb-2 text-[10px] font-semibold text-white/90">
                  Updated {updatedLabel}
                </p>
                <h1 className="font-serif text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
                  {normalizedTitle}
                </h1>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#6C5DD3]">About this project</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{normalizedDescription}</p>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Tech stack</h2>
            <p className="mt-1 text-sm text-slate-500">Technologies and tools used in this build</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#6C5DD3]/20 hover:bg-violet-50/80 hover:text-[#6C5DD3]"
                >
                  {tech}
                </span>
              ))}
              {techStack.length === 0 && (
                <p className="text-sm text-slate-500">No technologies listed yet.</p>
              )}
            </div>
          </section>

          {project.images && project.images.length > 1 && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-slate-900">Gallery</h2>
              <p className="mt-1 text-sm text-slate-500">Additional screenshots and visuals</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {project.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="overflow-hidden rounded-xl border border-slate-200/80 transition-all hover:border-[#6C5DD3]/25 hover:shadow-md"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Project screenshot ${img.displayOrder + 1}`}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Project links</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button
                className="h-11 w-full justify-start rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8] disabled:opacity-50"
                asChild={!!project.repositoryUrl}
                disabled={!project.repositoryUrl}
              >
                {project.repositoryUrl ? (
                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4 shrink-0" />
                    View source code
                    <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-70" />
                  </a>
                ) : (
                  <span>
                    <Github className="mr-2 h-4 w-4 shrink-0" />
                    No repository linked
                  </span>
                )}
              </Button>
              <Button
                variant={project.demoUrl ? "softSurface" : "soft"}
                className="h-11 w-full justify-start rounded-xl disabled:opacity-50"
                asChild={!!project.demoUrl}
                disabled={!project.demoUrl}
              >
                {project.demoUrl ? (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4 shrink-0" />
                    Project demo
                    <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" />
                  </a>
                ) : (
                  <span>
                    <Globe className="mr-2 h-4 w-4 shrink-0" />
                    No demo linked
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Details</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[#6C5DD3]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Last updated</p>
                  <p className="text-sm font-bold text-slate-800">{updatedLabel}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Owner</p>
                  <p className="text-sm font-bold text-slate-800">{ownerName}</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </StudentPageContainer>
  );
}

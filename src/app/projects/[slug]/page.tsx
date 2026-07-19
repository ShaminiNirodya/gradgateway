"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Github, Globe, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

type PublicProject = {
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
  images: { id: string; url: string; displayOrder: number }[];
};

export default function PublicProjectPage() {
  const params = useParams<{ slug: string }>();
  const projectId = params?.slug;

  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROJECTS.BY_ID(projectId));
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This project doesn't exist or isn't public."
              : "Failed to load project."
          );
        }
        const data = (await response.json()) as PublicProject;
        if (!cancelled) setProject(data);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-extrabold text-slate-800">Project not available</h1>
        <p className="text-slate-500 max-w-md">{error ?? "This project doesn't exist or isn't public."}</p>
        <Button asChild className="rounded-xl">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to GradGateway
          </Link>
        </Button>
      </div>
    );
  }

  const tech = project.techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const heroImage = project.images[0]?.url;
  const initials = project.studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> GradGateway
        </Link>

        {/* Header */}
        <div className="relative bg-slate-900 text-white rounded-[32px] overflow-hidden mb-8">
          {heroImage ? (
            <>
              <div className="h-52 lg:h-64 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt={project.title} className="w-full h-full object-cover opacity-70" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
            </>
          ) : (
            <div className="h-40 lg:h-52 w-full bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-900" />
          )}
          <div className="absolute inset-0 p-6 lg:p-10 flex items-end">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">{project.title}</h1>
              <p className="text-sm text-white/70 mt-2">
                By {project.studentName} · Updated {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: About + Gallery */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[24px] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">About This Project</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{project.description}</p>
            </section>

            {project.images.length > 0 && (
              <section className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Project Gallery</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.map((image) => (
                    <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt={project.title} className="w-full h-48 object-cover hover:scale-[1.02] transition-transform" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Author + Tech + Links */}
          <div className="space-y-8">
            <section className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-800">{project.studentName}</p>
                  <p className="text-xs text-slate-400">Student at GradGateway</p>
                </div>
              </div>
            </section>

            {tech.length > 0 && (
              <section className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {tech.map((t) => (
                    <Badge key={t} className="rounded-lg bg-slate-100 text-slate-700 font-bold" variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {(project.repositoryUrl || project.demoUrl) && (
              <section className="bg-white rounded-[24px] p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-800">Links</h3>
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Github className="w-4 h-4" /> Repository
                    <ExternalLink className="ml-auto w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Globe className="w-4 h-4" /> Live Demo
                    <ExternalLink className="ml-auto w-3.5 h-3.5 text-indigo-400" />
                  </a>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

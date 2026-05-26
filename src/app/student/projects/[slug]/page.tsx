"use client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ArrowLeft, Share2 } from "lucide-react";
import { allProjects } from "@/lib/data/projects";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ProjectDetail({ params }: { params: { slug: string } }) {
  const { show } = useToast();
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project) return notFound();

  const shareLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) {
      navigator.clipboard?.writeText(url);
      show({ title: "Link copied", description: "Project URL copied to clipboard", variant: "success", duration: 1500 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="rounded-xl" asChild>
          <Link href="/student/projects"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
        </Button>
        <Button variant="secondary" className="rounded-xl" onClick={shareLink}>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
      </div>

      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm">
        <div className="relative h-56 w-full">
          {/* using next/image for optimization if remote patterns are allowed */}
          <Image src={project.image} alt={project.title} fill className="object-cover" />
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-lg bg-white/90 text-slate-800">
            {project.category}
          </span>
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-slate-900">{project.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {project.views} views</span>
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {project.likes} likes</span>
            <span>{new Date(project.date).toLocaleDateString()}</span>
          </div>
          {project.summary && (
            <p className="mt-4 text-slate-700 text-sm">{project.summary}</p>
          )}
          <div className="mt-6">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Overview</h2>
            <p className="text-sm text-slate-600">
              This is a demo project detail page. Replace this content with your real project description, tech stack, responsibilities, challenges, and outcomes.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Actions</h3>
        <div className="flex items-center gap-2">
          <Button className="rounded-xl bg-[#6C5DD3] text-white">Contact Me</Button>
          <Button className="rounded-xl bg-slate-100 text-slate-800" onClick={shareLink}>Copy Link</Button>
        </div>
      </div>
    </div>
  );
}

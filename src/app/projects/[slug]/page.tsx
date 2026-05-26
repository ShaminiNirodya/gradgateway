import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Share2, Eye } from "lucide-react";

type Project = {
  title: string;
  description: string;
  features: string[];
  tech: string[];
  images: string[];
  author: { name: string; role: string; avatar?: string };
  team: { name: string; role: string; avatar?: string }[];
  stats: { views: number; likes: number };
};

const PROJECTS: Record<string, Project> = {
  "ai-code-review": {
    title: "AI-Powered Code Review Assistant",
    description:
      "A developer assistant that leverages GPT to analyze code for style, performance, and security. It generates actionable suggestions and PR comments.",
    features: [
      "Automatic code quality analysis using GPT",
      "Inline PR comments with suggestions",
      "Security vulnerability checks",
      "Customizable rules and templates",
      "Multi-language support",
      "VS Code and GitHub integration",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind", "OpenAI", "Prisma"],
    images: [
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    ],
    author: { name: "Kasun Perera", role: "Fullstack Developer" },
    team: [
      { name: "Kasun Perera", role: "Lead Dev" },
      { name: "Nirmal Fernando", role: "AI Researcher" },
      { name: "Sanduni Dias", role: "UX Designer" },
    ],
    stats: { views: 1824, likes: 236 },
  },
  "realtime-analytics": {
    title: "Realtime Analytics Dashboard",
    description:
      "A live analytics platform with WebSocket streams, interactive charts, and role-based access for business insights.",
    features: [
      "Live stream ingestion",
      "Role-based dashboards",
      "Custom KPIs and alerts",
      "Export to CSV/PDF",
      "Dark mode",
    ],
    tech: ["React", "Node.js", "WebSocket", "Tailwind"],
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      "https://images.unsplash.com/photo-1639322537231-2e4d52a64e13",
    ],
    author: { name: "Sanduni Dias", role: "Data Engineer" },
    team: [
      { name: "Sanduni Dias", role: "Lead Engineer" },
      { name: "Kasun Perera", role: "Front End" },
    ],
    stats: { views: 987, likes: 112 },
  },
};

export default function ProjectPortfolioPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS[params.slug];
  if (!project) return notFound();

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 lg:p-8">
      {/* Header */}
      <div className="relative bg-black text-white rounded-[32px] overflow-hidden mb-8">
        <div className="h-52 lg:h-64 w-full">
          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover opacity-80" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />
        <div className="absolute inset-0 p-6 lg:p-10 flex items-end justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">{project.title}</h1>
            <p className="text-sm lg:text-base text-white/80 max-w-2xl mt-2">
              {project.description}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <StatPill icon={<Eye className="w-4 h-4" />} label="Views" value={project.stats.views} />
            <StatPill icon={<Heart className="w-4 h-4" />} label="Likes" value={project.stats.likes} />
            <Button className="bg-white text-black hover:bg-slate-100 rounded-xl font-bold">Share <Share2 className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: About & Features */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">About This Project</h2>
            <p className="text-slate-600 leading-relaxed">
              {project.description}
            </p>
          </section>

          {/* Key Features */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Key Features</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {project.features.map((f) => (
                <div key={f} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{f}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Project Gallery</h3>
            <div className="grid grid-cols-2 gap-4">
              {project.images.map((src) => (
                <div key={src} className="rounded-2xl overflow-hidden">
                  <img src={src} alt="Gallery" className="w-full h-40 object-cover" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Author + Tech + Team + Comments */}
        <div className="space-y-8">
          {/* Owner card */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-800">{project.author.name}</p>
                  <p className="text-xs text-slate-400">{project.author.role}</p>
                </div>
              </div>
              <Button variant="ghost" className="rounded-xl">Contact Owner</Button>
            </div>
          </section>

          {/* Tech stack */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <Badge key={t} className="rounded-lg bg-slate-100 text-slate-700 font-bold" variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </section>

          {/* Team members */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Team Members</h3>
            <div className="space-y-4">
              {project.team.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="rounded-xl">View Profile</Button>
                </div>
              ))}
            </div>
          </section>

          {/* Comments */}
          <section className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Comments & Feedback</h3>
            <div className="rounded-2xl border border-slate-100 p-4 text-slate-400 text-sm">
              Comments coming soon. Stay tuned!
            </div>
          </section>
        </div>
      </div>

      {/* Related projects */}
      <Separator className="my-10" />
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Related Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PROJECTS)
            .filter(([key]) => key !== params.slug)
            .map(([key, p]) => (
              <a key={key} href={`/projects/${key}`} className="bg-white rounded-[24px] shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="h-32">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-400">Project</p>
                  <h4 className="font-bold text-slate-800">{p.title}</h4>
                </div>
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}

function StatPill({ icon, label, value }: any) {
  return (
    <div className="bg-white/10 text-white rounded-xl px-3 py-2 flex items-center gap-2">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      <span className="text-xs text-white/80">{value}</span>
    </div>
  );
}

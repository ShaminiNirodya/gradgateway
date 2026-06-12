import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { BookOpen, FolderGit2, FileText, MessageSquare, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Student Guides - GradGateway",
  description: "Guides for getting the most out of GradGateway as a student.",
};

const guides = [
  {
    icon: FolderGit2,
    title: "Build a portfolio that gets noticed",
    points: [
      "Publish 2-4 of your best projects, not everything you've ever built.",
      "Lead with the problem your project solves, then the tech stack.",
      "Add a repository link and, if possible, a live demo URL.",
      "Keep tech stacks honest — they feed directly into your searchable skills.",
    ],
  },
  {
    icon: FileText,
    title: "Apply like a professional",
    points: [
      "Read the required skills and address them in your cover letter.",
      "Keep cover letters under 150 words — specific beats long.",
      "Upload an up-to-date CV in your profile settings.",
      "Apply early; companies review applications as they arrive.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Make a good impression in messages",
    points: [
      "Reply to recruiter messages within a day where possible.",
      "Be concise and professional — this is a hiring conversation.",
      "Ask clarifying questions about the role; it signals genuine interest.",
    ],
  },
  {
    icon: CalendarCheck,
    title: "Ace your scheduled interviews",
    points: [
      "Check the Interviews page for date, time, mode, and meeting links.",
      "For online interviews, test your camera and microphone beforehand.",
      "Review the job description and your own application before joining.",
      "If you can't make it, message the company as early as possible.",
    ],
  },
];

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/60 to-white px-4 pb-12 pt-28">
        <div className="container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <BookOpen className="h-4 w-4" />
            Student guides
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Get the most out of GradGateway
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Practical, no-fluff guides for turning your student profile into interview invitations.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <article key={guide.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#6C5DD3]">
                <guide.icon className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-900">{guide.title}</h2>
              <ul className="mt-3 space-y-2">
                {guide.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C5DD3]" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="container mx-auto mt-12 max-w-xl text-center">
          <p className="text-slate-600">Ready to put these into practice?</p>
          <Button asChild className="mt-4 rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
            <Link href="/register/student">Create your student profile</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

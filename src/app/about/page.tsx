import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { GraduationCap, Building2, Sparkles, Target, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us - GradGateway",
  description: "GradGateway connects Sri Lankan undergraduates with top-tier industry opportunities.",
};

const values = [
  {
    icon: Target,
    title: "Merit over connections",
    body: "We believe verified skills and real projects should open doors — not who you know. Every student profile is built on demonstrable work.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by default",
    body: "Companies are accountable, students are real, and our admin team actively moderates the platform to keep it safe for everyone.",
  },
  {
    icon: HeartHandshake,
    title: "Free for students",
    body: "Students never pay to showcase their portfolio, apply to roles, or talk to recruiters. Opportunity should not have a price tag.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/60 to-white px-4 pb-16 pt-28">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <Sparkles className="h-4 w-4" />
            Our story
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Bridging the gap between campus and career
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            GradGateway is Sri Lanka&apos;s platform connecting ambitious undergraduates with
            top-tier industry opportunities. We help students turn university projects into proof
            of skill, and help companies discover talent before anyone else does.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#6C5DD3]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">For students</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Build a living portfolio of your projects, get discovered by recruiters, apply to
              internships and graduate roles, and manage interviews and offers — all in one place.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">For companies</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Search a directory of verified student talent, post openings, manage your applicant
              pipeline, message candidates directly, and schedule interviews without leaving the
              platform.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold text-slate-900">What we stand for</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#6C5DD3]">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Ready to get started?</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Join thousands of students and companies already using GradGateway.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
            <Link href="/register">Create an account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl font-bold">
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

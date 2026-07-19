"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/config";

const values = [
  {
    icon: Target,
    title: "Merit over connections",
    body: "Verified skills and real projects should open doors — not who you know.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by default",
    body: "Students are real, companies are accountable, and admins keep the platform safe.",
  },
  {
    icon: HeartHandshake,
    title: "Free for students",
    body: "Portfolios, applications, and messaging stay free for undergraduates.",
  },
];

type PlatformStats = {
  totalStudents: number;
  totalCompanies: number;
  totalProjects: number;
};

export default function AboutPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PLATFORM_STATS);
        if (response.ok) setStats(await response.json());
      } catch {
        // keep placeholders
      }
    };
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* About-only hero — editorial, not the landing page layout */}
      <section className="border-b border-slate-200/80 bg-slate-50 px-4 pb-14 pt-28">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6C5DD3]">About GradGateway</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
            We connect Sri Lankan undergraduates with the companies that need them.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            GradGateway is a hiring platform built around portfolios, applications, and direct
            recruiter messaging — so students can show real work and companies can hire with more
            context than a CV alone.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-200 pt-8 text-sm">
            <Stat label="Student profiles" value={stats?.totalStudents} />
            <Stat label="Company partners" value={stats?.totalCompanies} />
            <Stat label="Portfolio projects" value={stats?.totalProjects} />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Why we built this</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Too many talented undergraduates struggle to get noticed, while recruiters waste time
              sorting applications with little proof of ability. We built GradGateway to close that
              gap with one shared workflow for both sides.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-800">Students can</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Publish projects recruiters can review</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Apply to internships and graduate roles</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Track applications, interviews, and offers</li>
            </ul>
            <p className="pt-2 text-sm font-semibold text-slate-800">Companies can</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Search student talent by skills and university</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Post openings and manage hiring pipelines</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Message candidates and schedule interviews in-app</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Audience cards */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-extrabold text-slate-900">Built for two audiences</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#6C5DD3]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">For students</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                Turn coursework and side projects into a portfolio, get discovered by recruiters,
                and manage your entire job search from one dashboard.
              </p>
              <Button asChild className="mt-6 w-full rounded-xl sm:w-auto">
                <Link href="/register/student">Join as a student</Link>
              </Button>
            </div>
            <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">For companies</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                Find high-potential undergraduates early, run a structured pipeline, and keep every
                conversation tied to the application.
              </p>
              <Button asChild className="mt-6 w-full rounded-xl sm:w-auto">
                <Link href="/register/company">Register as a company</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6C5DD3]" />
            <h2 className="text-2xl font-extrabold text-slate-900">What we stand for</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="border-l-4 border-[#6C5DD3] pl-5">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-[#6C5DD3]">
                  <value.icon className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">Questions about GradGateway?</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          You do not need an account to reach our team.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
            <Link href="/contact">
              Contact us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-slate-900">{value ?? "—"}</p>
      <p className="mt-0.5 text-slate-500">{label}</p>
    </div>
  );
}

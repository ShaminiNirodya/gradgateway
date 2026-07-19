"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutGrid,
  MessageCircle,
  Sparkles,
  Users,
  Bell,
  Search,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { TestimonialService } from "@/lib/services/testimonial.service";
import type { PublicTestimonial } from "@/lib/types/testimonial";

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
    alt: "Students collaborating on campus",
  },
  {
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop",
    alt: "Student working on a laptop",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    alt: "Team planning a project",
  },
  {
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    alt: "Professional team meeting",
  },
];

const featureItems = [
  {
    icon: LayoutGrid,
    title: "Project portfolios",
    desc: "Showcase real coursework and side projects recruiters can explore before they message you.",
    accent: "from-[#6C5DD3] to-indigo-600",
  },
  {
    icon: Briefcase,
    title: "Openings & applications",
    desc: "Browse internships and graduate roles, apply in one flow, and track every stage in one hub.",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageCircle,
    title: "Messages & job offers",
    desc: "Chat with recruiters, receive offers in-thread, and respond without leaving the platform.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Talent search",
    desc: "Companies discover undergraduates by skills, university, GPA, and availability.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "CV & profiles",
    desc: "Upload your CV, keep your profile current, and let companies view it from your application.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: Bell,
    title: "Live notifications",
    desc: "Get alerted for new messages, status changes, and deadlines — then jump straight to the item.",
    accent: "from-rose-500 to-pink-600",
  },
];

const steps = [
  {
    icon: GraduationCap,
    title: "Build your profile",
    desc: "Add skills, projects, and your CV so recruiters see more than a PDF.",
  },
  {
    icon: Search,
    title: "Apply or get discovered",
    desc: "Apply to openings or receive direct offers from companies browsing talent.",
  },
  {
    icon: CheckCircle2,
    title: "Interview & get hired",
    desc: "Message recruiters, schedule interviews, and track hired outcomes in one place.",
  },
];

function formatNumber(num: number): string {
  if (num === 0) return "0";
  if (num >= 1000) return `${Math.floor(num / 1000)}k+`;
  return `${num}+`;
}

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalProjects: 0,
    hiringRate: 0,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [testimonialsLoaded, setTestimonialsLoaded] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PLATFORM_STATS);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setStatsLoaded(true);
        }
      } catch {
        // keep placeholders
      }
    };
    void loadStats();

    const loadTestimonials = async () => {
      try {
        const items = await TestimonialService.getPublished(6);
        setTestimonials(items);
      } catch {
        // keep section empty on failure
      } finally {
        setTestimonialsLoaded(true);
      }
    };
    void loadTestimonials();

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F7FB] font-sans selection:bg-[#6C5DD3] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-[#6C5DD3]/15 blur-[120px]" />
          <div className="absolute top-40 -left-32 h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(108 93 211 / 0.12) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6C5DD3]/20 bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#6C5DD3] shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Sri Lanka&apos;s grad hiring platform
              </div>

              <h1 className="font-serif text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                From portfolio to{" "}
                <span className="bg-gradient-to-r from-[#6C5DD3] via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  offer letter
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed text-slate-600 lg:mx-0">
                GradGateway connects undergraduates and recruiters with projects,
                applications, messaging, and real-time updates — built for how
                hiring actually works on campus.
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="h-12 min-w-[200px] rounded-2xl bg-[#6C5DD3] px-8 text-base font-bold shadow-lg shadow-[#6C5DD3]/30 hover:bg-[#5b4eb8]"
                >
                  <Link href="/register/student">
                    I&apos;m a student
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[200px] rounded-2xl border-slate-200 bg-white/90 text-base font-bold text-slate-800 hover:border-[#6C5DD3]/40 hover:bg-white"
                >
                  <Link href="/register/company">
                    <Building2 className="mr-2 h-4 w-4" />
                    I&apos;m hiring
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-500 lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Free for students
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card
                </span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-[#6C5DD3] hover:text-[#5b4eb8]"
                >
                  Log in
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-xl flex-1 lg:max-w-none">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-indigo-500/20 ring-1 ring-slate-200/60 transition-transform duration-500 hover:scale-[1.01]">
                {heroImages.map((image, index) => (
                  <Image
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className={cn(
                      "object-cover transition-opacity duration-1000 ease-in-out",
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    )}
                    priority={index === 0}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <div className="flex gap-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Show slide ${index + 1}`}
                        onClick={() => goToSlide(index)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          index === currentImageIndex
                            ? "w-8 bg-white"
                            : "w-2 bg-white/50 hover:bg-white/80"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="hero-float absolute -left-4 top-8 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/60 backdrop-blur-md sm:block lg:-left-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active students
                </p>
                <p className="text-2xl font-extrabold text-[#6C5DD3]">
                  {statsLoaded ? formatNumber(stats.totalStudents) : "—"}
                </p>
              </div>

              <div
                className="hero-float absolute -right-2 bottom-16 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/60 backdrop-blur-md sm:block lg:-right-6"
                style={{ animationDelay: "1.2s" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hiring rate
                </p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {statsLoaded ? `${stats.hiringRate}%` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience paths */}
      <section className="relative z-10 -mt-4 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AudienceCard
              icon={<GraduationCap className="h-7 w-7" />}
              title="For students"
              desc="Build a portfolio, apply to openings, track applications, and message recruiters."
              cta="Create student account"
              href="/register/student"
              variant="student"
            />
            <AudienceCard
              icon={<Building2 className="h-7 w-7" />}
              title="For companies"
              desc="Post roles, search talent, manage pipelines, send offers, and schedule interviews."
              cta="Create company account"
              href="/register/company"
              variant="company"
            />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-slate-200/80 bg-white/60 py-5 overflow-hidden">
        <div className="landing-marquee flex w-max gap-12 whitespace-nowrap px-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
          {[...Array(2)].map((_, copy) => (
            <span key={copy} className="flex gap-12">
              <span>Portfolios</span>
              <span>·</span>
              <span>Applications</span>
              <span>·</span>
              <span>Messages</span>
              <span>·</span>
              <span>Job offers</span>
              <span>·</span>
              <span>Interviews</span>
              <span>·</span>
              <span>Notifications</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <SectionHeader
            eyebrow="Features"
            title={
              <>
                Everything to go from <span className="text-[#6C5DD3]">campus to hired</span>
              </>
            }
            subtitle="One platform for students to stand out and companies to run a modern hiring pipeline."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="container mx-auto px-6">
          <SectionHeader
            eyebrow="Process"
            title="How GradGateway works"
            subtitle="Three steps — whether you are applying or recruiting."
          />

          <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="pointer-events-none absolute top-14 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-[#6C5DD3]/20 to-transparent md:block" />
            {steps.map((step, index) => (
              <StepCard key={step.title} step={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(#6C5DD3 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container relative z-10 mx-auto px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-300">
              Platform growth
            </p>
            <h2 className="mt-2 font-serif text-3xl font-extrabold lg:text-4xl">
              Built with real students &amp; recruiters
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-4 lg:divide-x lg:divide-slate-800">
            <StatItem
              number={statsLoaded ? formatNumber(stats.totalStudents) : "—"}
              label="Active students"
              loaded={statsLoaded}
            />
            <StatItem
              number={statsLoaded ? formatNumber(stats.totalCompanies) : "—"}
              label="Partner companies"
              loaded={statsLoaded}
            />
            <StatItem
              number={statsLoaded ? formatNumber(stats.totalProjects) : "—"}
              label="Projects hosted"
              loaded={statsLoaded}
            />
            <StatItem
              number={statsLoaded ? `${stats.hiringRate}%` : "—"}
              label="Hiring rate"
              loaded={statsLoaded}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <SectionHeader
            eyebrow="Community"
            title="Trusted on both sides of the hire"
            subtitle="Students and recruiters use GradGateway for clarity, speed, and fewer missed follow-ups."
          />
          {testimonialsLoaded && testimonials.length === 0 ? (
            <p className="mx-auto mb-8 max-w-xl text-center text-slate-500">
              Community stories will appear here soon.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="flex h-full flex-col rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="flex-1 text-base font-medium leading-relaxed text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-6 border-t border-slate-100 pt-4">
                    <p className="font-bold text-slate-900">{t.authorName}</p>
                    <p className="text-sm text-slate-500">{t.authorRole}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#6C5DD3]">
        {eyebrow}
      </span>
      <h2 className="mt-4 font-serif text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}

function AudienceCard({
  icon,
  title,
  desc,
  cta,
  href,
  variant,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  cta: string;
  href: string;
  variant: "student" | "company";
}) {
  const isStudent = variant === "student";
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-[1.75rem] border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        isStudent
          ? "border-[#6C5DD3]/15 hover:border-[#6C5DD3]/30 hover:shadow-[#6C5DD3]/10"
          : "border-slate-200/80 hover:border-indigo-200 hover:shadow-indigo-100/80"
      )}
    >
      <div
        className={cn(
          "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105",
          isStudent
            ? "bg-gradient-to-br from-[#6C5DD3] to-indigo-600 shadow-[#6C5DD3]/25"
            : "bg-gradient-to-br from-slate-800 to-slate-600 shadow-slate-400/30"
        )}
      >
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-slate-500">
        {desc}
      </p>
      <span
        className={cn(
          "mt-6 inline-flex items-center gap-1 text-sm font-bold",
          isStudent ? "text-[#6C5DD3]" : "text-slate-800"
        )}
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6C5DD3]/20 hover:shadow-lg hover:shadow-indigo-100/50">
      <div
        className={cn(
          "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
          accent
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#6C5DD3] transition-colors">
        {title}
      </h3>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  desc,
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative text-center">
      <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#F5F7FB] bg-white shadow-lg transition-transform duration-300 hover:scale-105">
        <Icon className="h-8 w-8 text-[#6C5DD3]" />
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#6C5DD3] text-xs font-extrabold text-white">
          {step}
        </span>
      </div>
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-slate-500">
        {desc}
      </p>
    </div>
  );
}

function StatItem({
  number,
  label,
  loaded,
}: {
  number: string;
  label: string;
  loaded: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-2 text-center transition-opacity duration-500",
        loaded ? "opacity-100" : "opacity-70"
      )}
    >
      <div className="font-serif text-4xl font-extrabold lg:text-5xl">{number}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </div>
    </div>
  );
}

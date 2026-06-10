"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  Rocket,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SupportInquiryForm } from "@/components/features/support/SupportInquiryForm";
import { PopularArticles } from "@/components/features/support/PopularArticles";
import { getArticlesForAudience, type HelpAudience } from "@/lib/content/help-articles";
import { cn } from "@/lib/utils";

type HelpSupportContentProps = {
  audience?: HelpAudience;
};

const categoryMeta: Record<
  string,
  { icon: typeof Rocket; gradient: string }
> = {
  "Getting Started": { icon: Rocket, gradient: "from-violet-500/10 to-indigo-500/5" },
  "For Students": { icon: GraduationCap, gradient: "from-blue-500/10 to-cyan-500/5" },
  "Profile & Projects": { icon: BookOpen, gradient: "from-blue-500/10 to-cyan-500/5" },
  "Applications": { icon: MessageSquare, gradient: "from-emerald-500/10 to-teal-500/5" },
  "For Companies": { icon: Sparkles, gradient: "from-amber-500/10 to-orange-500/5" },
  "Hiring & Talent": { icon: Sparkles, gradient: "from-amber-500/10 to-orange-500/5" },
  "Technical Support": { icon: Wrench, gradient: "from-rose-500/10 to-pink-500/5" },
};

function getCategories(audience: HelpAudience) {
  if (audience === "Student") {
    return [
      { name: "Getting Started", desc: "Learn the basics" },
      { name: "Profile & Projects", desc: "Build your presence" },
      { name: "Applications", desc: "Apply and track roles" },
      { name: "Technical Support", desc: "Troubleshooting" },
    ];
  }
  if (audience === "Company") {
    return [
      { name: "Getting Started", desc: "Learn the basics" },
      { name: "Hiring & Talent", desc: "Find candidates" },
      { name: "For Companies", desc: "Post and manage jobs" },
      { name: "Technical Support", desc: "Troubleshooting" },
    ];
  }
  return [
    { name: "Getting Started", desc: "Learn the basics" },
    { name: "For Students", desc: "Student resources" },
    { name: "For Companies", desc: "Hiring guide" },
    { name: "Technical Support", desc: "Troubleshooting" },
  ];
}

function getHeroCopy(audience: HelpAudience) {
  if (audience === "Student") {
    return {
      title: "Student Help Center",
      subtitle:
        "Guides for your profile, projects, and applications — or message our team directly.",
    };
  }
  if (audience === "Company") {
    return {
      title: "Recruiter Help Center",
      subtitle: "Guides for posting jobs and finding talent — or reach support anytime.",
    };
  }
  return {
    title: "How can we help you?",
    subtitle: "Browse articles and FAQs, or send a message to the GradGateway team.",
  };
}

export function HelpSupportContent({ audience = "All" }: HelpSupportContentProps) {
  const [search, setSearch] = useState("");
  const articles = useMemo(() => getArticlesForAudience(audience), [audience]);
  const categories = useMemo(() => getCategories(audience), [audience]);
  const hero = getHeroCopy(audience);

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.steps.some((s) => s.toLowerCase().includes(q))
    );
  }, [articles, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#6C5DD3] via-[#7c6fe0] to-[#5b4ec4] px-6 py-10 text-white shadow-lg shadow-[#6C5DD3]/20 md:px-10 md:py-12">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <LifeBuoy className="h-3.5 w-3.5" />
              Support & guides
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{hero.title}</h1>
            <p className="text-sm leading-relaxed text-white/85 md:text-base">{hero.subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm md:min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-white/70">Typical response</p>
                <p className="text-sm font-bold">24–48 hours</p>
              </div>
            </div>
            <a
              href="#support"
              className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-[#6C5DD3] transition hover:bg-white/90"
            >
              Contact support
            </a>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search articles and help topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-full border-slate-200 bg-white pl-12 pr-4 shadow-sm focus-visible:ring-[#6C5DD3]"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((c) => {
          const meta = categoryMeta[c.name] ?? categoryMeta["Getting Started"];
          const Icon = meta.icon;
          return (
            <div
              key={c.name}
              className={cn(
                "group rounded-[18px] border border-slate-100 bg-gradient-to-br p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                meta.gradient
              )}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#6C5DD3] shadow-sm transition group-hover:scale-105">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">{c.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{c.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Articles + Support */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Popular Articles</h2>
              <p className="text-xs text-slate-500">Step-by-step guides for common tasks</p>
            </div>
          </div>
          <PopularArticles articles={filteredArticles} audience={audience} />
          {search && filteredArticles.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No articles match your search.</p>
          )}
        </div>

        <div
          id="support"
          className="scroll-mt-6 rounded-[20px] border-2 border-[#6C5DD3]/20 bg-white p-6 shadow-md shadow-[#6C5DD3]/5 lg:col-span-3"
        >
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-gradient-to-r from-[#6C5DD3]/8 to-indigo-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6C5DD3] text-white shadow-sm">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Contact support</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your details are prefilled from your profile. We route every message to the admin
                Help & inquiries inbox.
              </p>
            </div>
          </div>
          <SupportInquiryForm defaultType="Support" variant="enhanced" />
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Quick answers before you reach out</p>
          </div>
        </div>
        <FAQAccordion audience={audience} search={search} />
      </div>
    </div>
  );
}

function FAQAccordion({ audience, search }: { audience: HelpAudience; search: string }) {
  const allItems = [
    {
      audiences: ["Student", "All"] as HelpAudience[],
      q: "How do I get started as a student?",
      a: "Create an account, complete your profile, browse opportunities, and apply to roles that match your skills.",
    },
    {
      audiences: ["Company", "All"] as HelpAudience[],
      q: "How do companies post jobs?",
      a: "Register as a company, complete your profile, then create opportunities from your dashboard.",
    },
    {
      audiences: ["Student", "Company", "All"] as HelpAudience[],
      q: "How long until support replies?",
      a: "We aim to respond within 24–48 hours on business days. Urgent issues can be marked in your message.",
    },
    {
      audiences: ["Student", "Company", "All"] as HelpAudience[],
      q: "Where does my support message go?",
      a: "Every request from this page is saved to the platform database and shown in the admin Help & inquiries section.",
    },
  ];

  const items = (
    audience === "All"
      ? allItems
      : allItems.filter((i) => i.audiences.includes(audience) || i.audiences.includes("All"))
  ).filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
  });

  const [open, setOpen] = useState<number | null>(0);

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No FAQs match your search.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div
            key={item.q}
            className={cn(
              "overflow-hidden rounded-xl border transition-colors",
              isOpen ? "border-[#6C5DD3]/30 bg-[#6C5DD3]/[0.03]" : "border-slate-200 bg-slate-50/50"
            )}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span className="text-sm font-semibold text-slate-800">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-slate-500 transition-transform",
                  isOpen && "rotate-180 text-[#6C5DD3]"
                )}
              />
            </button>
            {isOpen && (
              <div className="border-t border-slate-200/80 px-4 pb-4 pt-1 text-sm leading-relaxed text-slate-600">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

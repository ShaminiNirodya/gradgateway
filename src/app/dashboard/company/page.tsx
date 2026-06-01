"use client";
import { Search, Building2, Users2, Sparkles, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { CompanyService } from "@/lib/services/company.service";
import { ApplicationItem, ConversationItem, OpportunityItem } from "@/lib/types/dashboard";
import { CompanyProfile } from "@/lib/types/company";

export default function CompanyDashboard() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;

        const [apps, jobs, chats, profile] = await Promise.all([
          DashboardService.getCompanyApplications(token),
          DashboardService.getCompanyOpportunities(token),
          DashboardService.getMyConversations(token),
          CompanyService.getCurrentCompany(token),
        ]);

        setApplications(apps);
        setOpportunities(jobs);
        setConversations(chats);
        setCompany(profile);
      } catch {
        setApplications([]);
        setOpportunities([]);
        setConversations([]);
        setCompany(null);
      }
    };

    load();
  }, []);

  const shortlistedCount = useMemo(
    () => applications.filter((item) => item.status.toLowerCase().includes("short")).length,
    [applications]
  );

  const recentApplicants = useMemo(
    () => applications.slice(0, 5),
    [applications]
  );

  const applicantsByDay = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = labels.map((label) => ({ label, value: 0 }));

    applications.forEach((row) => {
      const date = new Date(row.appliedAt);
      const index = date.getDay() === 0 ? 6 : date.getDay() - 1;
      base[index].value += 1;
    });

    return base;
  }, [applications]);

  const linePoints = useMemo(() => {
    const max = Math.max(1, ...applicantsByDay.map((point) => point.value));
    return applicantsByDay
      .map((point, index) => {
        const x = index * 50;
        const y = 80 - Math.round((point.value / max) * 70);
        return `${x},${y}`;
      })
      .join(" ");
  }, [applicantsByDay]);

  const companyInitial = (company?.companyName || "C").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search candidates, skills, portfolios..."
          className="w-full bg-white border-none rounded-2xl h-12 pl-12 text-slate-600 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/dashboard/company/talent?q=${encodeURIComponent(q.trim())}`);
            }
          }}
        />
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard icon={<Users2 className="w-4 h-4" />} title="Total Applicants" value={String(applications.length)} href="/dashboard/company/applications" />
        <InfoCard icon={<Sparkles className="w-4 h-4" />} title="Shortlisted" value={String(shortlistedCount)} href="/dashboard/company/applications" />
        <InfoCard icon={<Building2 className="w-4 h-4" />} title="Open Roles" value={String(opportunities.filter((o) => o.isActive).length)} href="/dashboard/company/jobs" />
        <InfoCard icon={<MessageSquare className="w-4 h-4" />} title="Messages" value={String(conversations.length)} href="/dashboard/company/messages" />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/company/talent">Browse Talent <ChevronRight className="w-4 h-4 ml-1" /></Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/applications">View Applications</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/messages">Open Messages</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Section */}
        {/* Analytics Section */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Total Applicants</h2>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-2 py-1 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-extrabold text-slate-800">{applications.length}</span>
            <span className="text-sm font-bold text-emerald-500 ml-2">live applicants</span>
          </div>

          <div className="h-48 w-full relative">
            {/* Simple SVG Line Graph */}
            <svg className="w-full h-full text-[#6C5DD3] overflow-visible" viewBox="0 0 350 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline points={linePoints} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points={`${linePoints} 350,100 0,100`} fill="url(#gradient)" stroke="none" />

              {/* Data Points */}
              {linePoints.split(" ").map((pair, i) => {
                const [x, y] = pair.split(",");
                return (
                <circle key={i} cx={i * 50} cy={y} r="4" className="fill-white stroke-[#6C5DD3] stroke-2 hover:r-6 transition-all cursor-pointer" />
                );
              })}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Today</span>
            </div>
          </div>
        </section>

        {/* Company About Section */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">About Company</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/company/settings">Edit</Link>
            </Button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 rounded-2xl shadow-md shadow-blue-200">
                {company?.logoDataUrl && <AvatarImage src={company.logoDataUrl} alt={company.companyName} className="object-cover" />}
                <AvatarFallback className="bg-blue-500 text-white text-3xl font-bold rounded-2xl">
                  {companyInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-slate-800 text-xl">{company?.companyName || "Company"}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{company?.industry || "Industry"} • Sri Lanka</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {company
                  ? `${company.companyName} recruits top undergraduate talent for ${company.industry.toLowerCase()} roles. Contact: ${company.recruiterName} (${company.position}).`
                  : "Your company profile will appear here once loaded."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                {applications.length} Applicants
              </div>
              <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                {opportunities.length} Job Posts
              </div>
              <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                {conversations.length} Conversations
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent applicants */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Applicants</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/company/applications">View all</Link></Button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {recentApplicants.map((candidate) => (
            <Link
              key={candidate.id}
              href={`/dashboard/company/candidate/${encodeURIComponent(candidate.studentName.toLowerCase().replace(/\s+/g, '-'))}?id=${candidate.studentProfileId}&email=${encodeURIComponent(candidate.studentEmail)}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800">{candidate.studentName}</div>
                <div className="text-xs text-slate-500">{candidate.jobTitle}</div>
              </div>
            </Link>
          ))}
          {!recentApplicants.length && <div className="px-4 py-3 text-sm text-slate-500">No applicants yet.</div>}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, value, href }: any) {
  const content = (
    <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-xs text-slate-500">{title}</div>
          <div className="text-base font-bold text-slate-800">{value}</div>
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}



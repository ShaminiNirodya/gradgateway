"use client";
import { Search, FolderOpen, FileText, MessageSquare, Award, BadgeCheck, Info, Zap, CheckCircle2, ScrollText, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useStudentProfile } from "@/lib/hooks/useStudentProfile";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ProjectService } from "@/lib/services/project.service";
import { StudentService, type StudentSkillItem } from "@/lib/services/student.service";
import { ApplicationItem, OpportunityItem } from "@/lib/types/dashboard";
import { useUnreadConversations } from "@/components/shared/UnreadConversationsProvider";
import { ProjectItem } from "@/lib/types/project";
import StudentNotificationBell from "@/components/features/student/StudentNotificationBell";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";
import {
  applicationStatusBadgeClass,
  applicationStatusLabel,
  normalizeApplicationStatus,
} from "@/lib/constants/application-status";
import { SkillsPicker } from "@/components/shared/SkillsPicker";

export default function StudentDashboard() {
  const router = useRouter();
  const { displayName, initials, profile } = useStudentProfile();
  const [q, setQ] = useState("");
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const { unreadCount: newMessagesCount } = useUnreadConversations();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [availability, setAvailability] = useState("Available Now");
  const [mySkills, setMySkills] = useState<StudentSkillItem[]>([]);
  const [derivedSkills, setDerivedSkills] = useState<string[]>([]);

  const selectedSkillNames = useMemo(
    () => new Set(mySkills.map((skill) => skill.name)),
    [mySkills]
  );

  const readonlySkillTags = useMemo(
    () =>
      derivedSkills
        .filter((skill) => !mySkills.some((m) => m.name.toLowerCase() === skill.toLowerCase()))
        .map((name) => ({ name, title: "From your project tech stacks" })),
    [derivedSkills, mySkills]
  );

  const handleSkillToggle = (skill: string) => {
    if (selectedSkillNames.has(skill)) {
      const existing = mySkills.find((s) => s.name === skill);
      if (existing) void removeSkill(existing.id);
      return;
    }
    void handleAddSkill(skill);
  };

  const handleAddSkill = async (skill: string) => {
    if (
      mySkills.some((s) => s.name.toLowerCase() === skill.toLowerCase()) ||
      derivedSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
    ) {
      return;
    }
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const added = await StudentService.addSkill(token, skill);
      setMySkills((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Failed to add skill:", error);
    }
  };

  const removeSkill = async (studentSkillId: string) => {
    const previous = mySkills;
    setMySkills((prev) => prev.filter((s) => s.id !== studentSkillId));
    try {
      const token = await AuthService.getIdToken();
      if (!token) throw new Error("Not signed in");
      await StudentService.removeSkill(token, studentSkillId);
    } catch (error) {
      console.error("Failed to remove skill:", error);
      setMySkills(previous);
    }
  };

  const handleAvailabilityChange = async (newAvailability: string) => {
    setAvailability(newAvailability);
    if (!profile) return;
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await StudentService.registerStudent(token, {
        ...profile,
        availability: newAvailability,
        gradYear: String(profile.gradYear),
        gpa: String(profile.gpa),
      });
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [openings, token] = await Promise.all([
          DashboardService.getStudentOpportunities(),
          AuthService.getIdToken(),
        ]);

        setOpportunities(openings);

        if (!token) return;

        const [myApps, myProjects, savedSkills] = await Promise.all([
          DashboardService.getMyApplications(token),
          ProjectService.getMyProjects(token),
          StudentService.getMySkills(token).catch(() => [] as StudentSkillItem[]),
        ]);

        setApplications(myApps);
        setProjects(myProjects);
        setMySkills(savedSkills);

        setDerivedSkills(
          Array.from(
            new Set(
              myProjects
                .flatMap((project) => (project.techStack || "").split(","))
                .map((skill) => skill.trim())
                .filter(Boolean)
            )
          )
        );
      } catch {
        setOpportunities([]);
        setApplications([]);
        setProjects([]);
        setMySkills([]);
        setDerivedSkills([]);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (profile?.availability) {
      setAvailability(profile.availability);
    }
  }, [profile?.availability]);

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    []
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const activeApplications = useMemo(
    () => applications.filter((a) => !["Rejected", "Hired"].includes(a.status)).length,
    [applications]
  );

  const certifications = useMemo(() => profile?.certifications ?? [], [profile?.certifications]);
  const awards = useMemo(() => profile?.awards ?? [], [profile?.awards]);
  const hackathonsCompetitions = useMemo(
    () => profile?.hackathonsCompetitions ?? [],
    [profile?.hackathonsCompetitions],
  );

  return (
    <StudentPageContainer>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#6C5DD3]/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6C5DD3]">
              Student dashboard
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.65rem]">
              {greeting},{" "}
              <span className="text-[#6C5DD3]">{displayName}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500">{todayLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Button
              asChild
              className="h-10 rounded-xl bg-[#6C5DD3] px-5 shadow-md shadow-indigo-200/60 hover:bg-[#5b4eb8]"
            >
              <Link href="/dashboard/student/openings">Find Jobs</Link>
            </Button>
            <StudentNotificationBell align="end" side="bottom" />
            <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white ring-offset-2 ring-offset-slate-100">
              <AvatarImage src={profile?.photoDataUrl} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-50 text-xs font-bold text-orange-600">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search your projects, applications, messages..."
          className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white pl-12 text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:border-[#6C5DD3]/40 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/dashboard/student/projects?q=${encodeURIComponent(q.trim())}`);
            }
          }}
        />
      </div>

      <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        <StatCard icon={<FolderOpen className="w-3.5 h-3.5" />} label="Projects" value={String(projects.length)} href="/dashboard/student/projects" />
        <StatCard icon={<FileText className="w-3.5 h-3.5" />} label="Applications" value={`${activeApplications} active`} href="/dashboard/student/applications" />
        <StatCard icon={<MessageSquare className="w-3.5 h-3.5" />} label="Messages" value={`${newMessagesCount} new`} href="/dashboard/student/messages" />
        <StatCard
          icon={<ScrollText className="w-3.5 h-3.5" />}
          label="CV"
          value={profile?.cvUrl ? "Visit CV" : "Upload CV"}
          externalHref={profile?.cvUrl || undefined}
          href={profile?.cvUrl ? undefined : "/dashboard/student/settings"}
        />

        <div className={cn(STAT_CARD_CLASS, "hover:translate-y-0")}>
          <div className="flex h-full items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                availability === "Available Now"
                  ? "bg-emerald-50 text-emerald-600"
                  : availability === "Actively Looking"
                    ? "bg-blue-50 text-blue-600"
                    : availability === "Open to Offers"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-600",
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Availability
              </div>
              <Select value={availability} onValueChange={handleAvailabilityChange}>
                <SelectTrigger className="h-8 w-full border-0 bg-transparent p-0 text-sm font-extrabold text-slate-900 shadow-none hover:bg-slate-50/80 focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:opacity-50">
                  <SelectValue className="truncate">{availability}</SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[240px] rounded-xl border-slate-200 bg-white shadow-xl">
                  <SelectItem value="Available Now" className="font-semibold text-slate-700 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-bold">Available Now</div>
                        <div className="text-xs text-slate-500">Ready to start immediately</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Actively Looking" className="font-semibold text-slate-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-bold">Actively Looking</div>
                        <div className="text-xs text-slate-500">Currently searching</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Open to Offers" className="font-semibold text-slate-700 focus:bg-amber-50 focus:text-amber-700 cursor-pointer py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="font-bold">Open to Offers</div>
                        <div className="text-xs text-slate-500">Considering opportunities</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Not Looking" className="font-semibold text-slate-700 focus:bg-slate-50 focus:text-slate-700 cursor-pointer py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div>
                        <div className="font-bold">Not Looking</div>
                        <div className="text-xs text-slate-500">Not available at this time</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Recent Projects" href="/dashboard/student/projects" linkLabel="See all" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(projects.length ? projects.slice(0, 2) : []).map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              techStack={project.techStack}
              title={project.title}
              author={project.studentName || displayName}
              avatar={initials}
              imageUrl={project.images?.[0]?.imageUrl}
            />
          ))}
          {!projects.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              No project records found yet. Add one from the Projects page.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Recent Applications" href="/dashboard/student/applications" linkLabel="View all" />
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {(applications.length
            ? applications.slice(0, 3).map((a) => ({
                role: a.jobTitle,
                company: a.companyName,
                status: a.status,
                date: new Date(a.appliedAt).toLocaleDateString("en-LK", {
                  month: "short",
                  day: "numeric",
                }),
              }))
            : [
                {
                  role: "No applications yet",
                  company: profile?.university || "",
                  status: "Start applying",
                  date: "",
                },
              ]
          ).map((a, index) => {
            const statusKey = applications.length
              ? normalizeApplicationStatus(a.status)
              : null;
            const statusLabel = applications.length
              ? applicationStatusLabel(a.status)
              : a.status;

            return (
              <Link
                key={`${a.company}-${a.role}-${index}`}
                href="/dashboard/student/applications"
                className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition-colors last:border-b-0 hover:bg-slate-50/80"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-800">{a.role}</div>
                  <div className="truncate text-xs font-medium text-slate-500">{a.company}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ring-inset",
                      statusKey
                        ? applicationStatusBadgeClass(statusKey)
                        : "bg-slate-100 text-slate-600 ring-slate-200",
                    )}
                  >
                    {statusLabel}
                  </span>
                  {a.date ? (
                    <span className="hidden text-xs font-semibold text-slate-400 sm:inline">{a.date}</span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <SkillsPicker
          variant="tags"
          showLabel={false}
          toolbar={
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Technical Skills</h2>
                <p className="text-xs font-medium text-slate-500">Showcase what you work with</p>
              </div>
            </div>
          }
          toolbarClassName="border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white px-6 py-5"
          tagsContainerClassName="flex-wrap gap-2 border-0 bg-transparent p-6 shadow-none min-h-0"
          menuAlign="end"
          selected={selectedSkillNames}
          onToggle={handleSkillToggle}
          readonlyTags={readonlySkillTags}
          emptyMessage="No skills yet. Add skills here, or create projects — tech stacks appear automatically."
          className="space-y-0"
        />
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">About</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {profile
              ? `${profile.fullName} from ${profile.university}, ${profile.fieldOfMajor ? `${profile.fieldOfMajor}, ` : ""}studying ${profile.degree} (Class of ${profile.gradYear}) with GPA ${profile.gpa}.`
              : "Complete your profile in settings to load your about section."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileListCard
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Certifications"
            items={certifications}
            emptyLabel="Add certifications from Settings."
          />
          <ProfileListCard
            icon={<Award className="h-5 w-5" />}
            title="Awards & Honors"
            items={awards}
            emptyLabel="Add awards & honors from Settings."
          />
          <ProfileListCard
            icon={<Trophy className="h-5 w-5" />}
            title="Hackathons & Competitions"
            items={hackathonsCompetitions}
            emptyLabel="Add hackathons & competitions from Settings."
          />
        </div>
      </section>
    </StudentPageContainer>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
      <Link
        href={href}
        className="text-xs font-bold text-[#6C5DD3] transition-colors hover:text-[#5b4eb8]"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function ProfileListCard({
  icon,
  title,
  items,
  emptyLabel,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 font-semibold text-slate-800"
          >
            {item}
          </li>
        ))}
        {!items.length && <li className="text-xs font-medium text-slate-500">{emptyLabel}</li>}
      </ul>
    </div>
  );
}

const STAT_CARD_CLASS =
  "group h-full min-h-[4.5rem] rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C5DD3]/20 hover:shadow-md";

function StatCard({
  icon,
  label,
  value,
  href,
  externalHref,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  externalHref?: string;
}) {
  const isClickable = Boolean(href || externalHref);
  const content = (
    <div className={cn(STAT_CARD_CLASS, isClickable && "cursor-pointer")}>
      <div className="flex h-full items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3] transition-colors group-hover:bg-[#6C5DD3]/15">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="truncate text-sm font-extrabold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
  if (externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/30"
      >
        {content}
      </a>
    );
  }

  return href ? (
    <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/30 rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
}

function ProjectCard({ techStack, title, author, avatar, id, imageUrl }: any) {
  const techTags = (techStack || "")
    .split(",")
    .map((skill: string) => skill.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link
      href={`/dashboard/student/projects/${id || "1"}`}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/30 rounded-[24px]"
    >
      <div className="group flex h-full cursor-pointer flex-col rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C5DD3]/20 hover:shadow-lg">
        <div className="relative mb-4 h-40 overflow-hidden rounded-[20px] bg-gradient-to-br from-indigo-200 via-violet-200 to-purple-300">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <h3 className="mb-2 line-clamp-2 text-lg font-extrabold leading-snug text-slate-900">{title}</h3>
        {techTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {techTags.map((tech: string) => (
              <span
                key={tech}
                className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-orange-100 text-[10px] font-bold text-orange-600">
              {avatar}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-slate-500">{author}</span>
        </div>
      </div>
    </Link>
  );
}

// Removed mentor and right-rail sections to keep dashboard focused

"use client";
import { Search, FolderOpen, FileText, MessageSquare, ChevronRight, PlayCircle, Award, BadgeCheck, Info, Plus, Zap, X, CheckCircle2, UserCircle, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStudentProfile } from "@/lib/hooks/useStudentProfile";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ProjectService } from "@/lib/services/project.service";
import { StudentService } from "@/lib/services/student.service";
import { ApplicationItem, ConversationItem, OpportunityItem } from "@/lib/types/dashboard";
import { ProjectItem } from "@/lib/types/project";

export default function StudentDashboard() {
  const router = useRouter();
  const { displayName, initials, profile } = useStudentProfile();
  const [q, setQ] = useState("");
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [availability, setAvailability] = useState("Available Now");
  const [skills, setSkills] = useState<string[]>([]);
  const AVAILABLE_SKILLS = [
    "React", "Node.js", "Python", "Java", "TypeScript",
    "Machine Learning", "UI/UX Design", "Flutter", "DevOps",
    "Spring Boot", "PostgreSQL", "MongoDB", "AWS", "Docker"
  ];

  const handleAddSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
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

        const [myApps, myConversations, myProjects] = await Promise.all([
          DashboardService.getMyApplications(token),
          DashboardService.getMyConversations(token),
          ProjectService.getMyProjects(token),
        ]);

        setApplications(myApps);
        setConversations(myConversations);
        setProjects(myProjects);

        const derivedSkills = Array.from(
          new Set(
            myProjects
              .flatMap((project) => (project.techStack || "").split(","))
              .map((skill) => skill.trim())
              .filter(Boolean)
          )
        );

        setSkills(derivedSkills);
      } catch {
        setOpportunities([]);
        setApplications([]);
        setConversations([]);
        setProjects([]);
        setSkills([]);
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

  const unreadMessages = useMemo(
    () => conversations.filter((c) => Boolean(c.lastMessage)).length,
    [conversations]
  );

  const certifications = useMemo(() => profile?.certifications ?? [], [profile?.certifications]);
  const awards = useMemo(() => profile?.awards ?? [], [profile?.awards]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{greeting}, {displayName}</h1>
          <p className="text-sm text-slate-500">{todayLabel}</p>
        </div>
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.photoDataUrl} alt={displayName} />
          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search your projects, applications, messages..."
          className="w-full bg-white border-none rounded-2xl h-12 pl-12 text-slate-600 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/dashboard/student/projects?q=${encodeURIComponent(q.trim())}`);
            }
          }}
        />
      </div>

      {/* Key stats & Availability row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        <StatCard icon={<FolderOpen className="w-4 h-4" />} label="Projects" value={String(projects.length)} href="/dashboard/student/projects" />
        <StatCard icon={<FileText className="w-4 h-4" />} label="Applications" value={`${activeApplications} active`} href="/dashboard/student/applications" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Messages" value={`${unreadMessages} recent`} href="/dashboard/student/messages" />

        {/* Availability Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
              availability === "Available Now" ? "bg-emerald-50 text-emerald-600" :
              availability === "Actively Looking" ? "bg-blue-50 text-blue-600" :
              availability === "Open to Offers" ? "bg-amber-50 text-amber-600" :
              "bg-slate-100 text-slate-600"
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 font-medium mb-1">Availability</div>
              <Select value={availability} onValueChange={handleAvailabilityChange}>
                <SelectTrigger className="w-full h-auto px-2 py-1 border border-transparent hover:border-slate-200 hover:bg-slate-50 rounded-lg transition-colors focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-0">
                  <SelectValue className="text-base font-bold text-slate-800">
                    {availability}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-slate-200 shadow-xl min-w-[240px]">
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

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/student/projects">View Projects <ChevronRight className="w-4 h-4 ml-1" /></Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/student/openings">Find Jobs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/student/messages">Open Messages</Link>
        </Button>
      </div>

      {/* Recent projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Projects</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/student/projects">See all</Link></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(projects.length ? projects.slice(0, 2) : []).map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              tag={project.techStack.split(",")[0]?.trim() || "Project"}
              title={project.title}
              author={project.studentName || displayName}
              avatar={initials}
              imageUrl={project.images?.[0]?.imageUrl}
            />
          ))}
          {!projects.length && (
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-dashed border-slate-200 text-center text-slate-500 text-sm">
              No project records found yet. Add one from the Projects page.
            </div>
          )}
        </div>
      </section>

      {/* Recent applications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Applications</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/student/applications">View all</Link></Button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {(applications.length ? applications.slice(0, 3).map((a) => ({
            role: a.jobTitle,
            company: a.companyName,
            status: a.status,
            date: new Date(a.appliedAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
          })) : [{ role: "No applications yet", company: profile?.university || "", status: "Start applying", date: "" }]).map((a) => (
            <Link key={`${a.company}-${a.role}`} href="/dashboard/student/applications" className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div>
                <div className="text-sm font-semibold text-slate-800">{a.role}</div>
                <div className="text-xs text-slate-500">{a.company}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${a.status === "Interview" ? "bg-emerald-50 text-emerald-700" : a.status === "Under Review" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{a.status}</span>
                <span className="text-xs text-slate-400">{a.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Technical Skills */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Technical Skills</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white max-h-60 overflow-y-auto">
              {AVAILABLE_SKILLS.filter(s => !skills.includes(s)).map((skill) => (
                <DropdownMenuItem key={skill} onClick={() => handleAddSkill(skill)}>
                  {skill}
                </DropdownMenuItem>
              ))}
              {AVAILABLE_SKILLS.filter(s => !skills.includes(s)).length === 0 && (
                <div className="p-2 text-xs text-slate-400">All skills added</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill} className="group relative">
              <Badge className="px-4 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border-none text-sm font-bold flex items-center gap-2">
                {skill}
                <X
                  className="w-3 h-3 text-slate-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            </div>
          ))}
          {!skills.length && <p className="text-sm text-slate-400">No skills found yet. Add projects with tech stack to populate this list.</p>}
        </div>
      </section>

      {/* About, Certifications, Awards & Honors */}
      <section className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">About</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {profile
              ? `${profile.fullName} from ${profile.university}, ${profile.fieldOfMajor ? `${profile.fieldOfMajor}, ` : ""}studying ${profile.degree} (Class of ${profile.gradYear}) with GPA ${profile.gpa}.`
              : "Complete your profile in settings to load your about section."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck className="w-5 h-5 text-slate-500" />
              <h3 className="text-[17px] font-bold text-slate-800">Certifications</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {certifications.map((item) => (
                <li key={item} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
              {!certifications.length && <li className="text-xs text-slate-500">Add certifications from Settings.</li>}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-slate-500" />
              <h3 className="text-[17px] font-bold text-slate-800">Awards & Honors</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {awards.map((item) => (
                <li key={item} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
              {!awards.length && <li className="text-xs text-slate-500">Add awards & honors from Settings.</li>}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, href }: any) {
  const content = (
    <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-base font-bold text-slate-800">{value}</div>
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function ProjectCard({ tag, title, author, avatar, id, imageUrl }: any) {
  return (
    <Link href={`/dashboard/student/projects/${id || "1"}`}>
      <div className="bg-white p-4 rounded-[24px] shadow-sm hover:shadow-lg transition-all cursor-pointer group">
        <div className="h-40 rounded-[20px] overflow-hidden relative mb-4 bg-gradient-to-br from-indigo-200 via-violet-200 to-purple-300">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-slate-700 uppercase">{tag}</div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white fill-white/20" />
          </div>
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-bold">{avatar}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-500 font-medium">{author}</span>
        </div>
      </div>
    </Link>
  );
}

// Removed mentor and right-rail sections to keep dashboard focused

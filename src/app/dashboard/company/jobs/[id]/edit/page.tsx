"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

const ALL_SKILLS = [
  "React", "Vue.js", "Angular", "Svelte", "Next.js", "Node.js", "Express.js",
  "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C#", ".NET",
  "Go", "Rust", "PHP", "Laravel", "Ruby", "Rails", "TypeScript", "JavaScript",
  "Flutter", "React Native", "Swift", "Kotlin", "Android", "iOS",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "AWS", "Azure",
  "Google Cloud", "Docker", "Kubernetes", "DevOps", "CI/CD", "Git",
  "Machine Learning", "Data Science", "AI", "TensorFlow", "PyTorch",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Tailwind CSS",
  "Bootstrap", "Material-UI", "GraphQL", "REST API", "Microservices",
  "Agile", "Scrum", "Leadership", "Communication", "Problem Solving"
].sort();

const ONLINE_LOCATION = "Remote (Online)";

export default function EditCompanyJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const opportunityId = params?.id;
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunityType, setOpportunityType] = useState("Internship");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [monthlyStipendLkr, setMonthlyStipendLkr] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");

  useEffect(() => {
    if (!opportunityId) return;
    let cancelled = false;

    (async () => {
      try {
        const job = await DashboardService.getOpportunityById(opportunityId);
        if (cancelled) return;

        setTitle(job.title);
        setDescription(job.description);
        setOpportunityType(job.opportunityType);
        setWorkMode(job.workMode);
        setLocation(job.location);
        setMonthlyStipendLkr(
          job.monthlyStipendLkr != null ? String(job.monthlyStipendLkr) : ""
        );
        setDeadlineAt(new Date(job.deadlineAt).toISOString().slice(0, 10));

        const skills = (job.requiredSkills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const known = skills.filter((s) => ALL_SKILLS.includes(s));
        const custom = skills.filter((s) => !ALL_SKILLS.includes(s));
        setSelectedSkills(new Set(known));
        setCustomSkills(custom);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Failed to load job post.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  const isOnline = workMode === "Remote";
  const locationRequired = workMode === "Hybrid";

  const allSelectedSkills = useMemo(
    () => [...customSkills, ...Array.from(selectedSkills)],
    [customSkills, selectedSkills]
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const removeCustomSkill = (skill: string) => {
    setCustomSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!opportunityId) return;

    if (!title.trim()) {
      show({ title: "Missing title", description: "Job title is required.", variant: "warning" });
      return;
    }
    if (locationRequired && !location.trim()) {
      show({ title: "Missing location", description: "Hybrid roles require a work location.", variant: "warning" });
      return;
    }
    if (allSelectedSkills.length === 0 || !deadlineAt) {
      show({ title: "Missing fields", description: "Skills and deadline are required.", variant: "warning" });
      return;
    }

    const deadlineDate = new Date(`${deadlineAt}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      show({ title: "Invalid deadline", description: "Deadline must be today or a future date.", variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) throw new Error("Please sign in again.");

      await DashboardService.updateCompanyOpportunity(token, opportunityId, {
        title: title.trim(),
        description: description.trim() || "No description provided.",
        opportunityType,
        workMode,
        location: isOnline ? ONLINE_LOCATION : location.trim() || "Not specified",
        requiredSkills: allSelectedSkills.join(", "),
        monthlyStipendLkr: monthlyStipendLkr.trim() ? Number(monthlyStipendLkr) : null,
        deadlineAt: deadlineDate.toISOString(),
      });

      show({ title: "Job updated", description: "Your changes are now live.", variant: "success" });
      router.push("/dashboard/company/jobs");
      router.refresh();
    } catch (error) {
      show({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update job post.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading job post...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {loadError}
        </div>
        <Button variant="soft" onClick={() => router.push("/dashboard/company/jobs")}>
          Back to Job Posts
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Edit Job Post</h1>
        <p className="text-sm text-slate-500 mt-1">Update details for this position. Changes go live immediately.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div className="space-y-2">
          <Label>Job Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Software Engineering Intern" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Opportunity Type *</Label>
            <select value={opportunityType} onChange={(e) => setOpportunityType(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="Internship">Internship</option>
              <option value="GraduateRole">Graduate Role</option>
              <option value="PartTime">Part Time</option>
              <option value="Contract">Full Time</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Work Mode *</Label>
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="Onsite">Onsite</option>
              <option value="Remote">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location{locationRequired ? " *" : ""}</Label>
          <Input
            value={isOnline ? ONLINE_LOCATION : location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isOnline}
            className={cn(isOnline && "bg-slate-100 text-slate-500 cursor-not-allowed")}
            placeholder="e.g. Colombo"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[130px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Describe role responsibilities and expectations"
          />
        </div>

        <div className="space-y-2">
          <Label>Required Skills *</Label>
          <DropdownMenu open={isSkillDropdownOpen} onOpenChange={setIsSkillDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full min-h-10 h-auto justify-between gap-2 rounded-xl border-slate-200 py-2 pl-3 pr-2 text-left font-normal hover:bg-slate-50",
                  allSelectedSkills.length > 0 && "items-start"
                )}
              >
                {allSelectedSkills.length === 0 ? (
                  <span className="text-slate-500">Select required skills...</span>
                ) : (
                  <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {allSelectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex max-w-full items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        <span className="truncate">{skill}</span>
                        <span
                          className="shrink-0 cursor-pointer rounded-sm hover:bg-indigo-100"
                          aria-label={`Remove ${skill}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (customSkills.includes(skill)) removeCustomSkill(skill);
                            else toggleSkill(skill);
                          }}
                        >
                          <X className="h-3 w-3" aria-hidden />
                        </span>
                      </span>
                    ))}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white w-[400px] rounded-xl shadow-xl border-slate-100 p-0">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="pl-9 h-9 rounded-lg border-slate-200"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {ALL_SKILLS
                  .filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()))
                  .map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-sm"
                    >
                      <Checkbox checked={selectedSkills.has(skill)} onCheckedChange={() => toggleSkill(skill)} />
                      <span className="text-slate-700">{skill}</span>
                    </label>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Monthly Stipend (LKR)</Label>
            <Input value={monthlyStipendLkr} onChange={(e) => setMonthlyStipendLkr(e.target.value)} placeholder="e.g. 120000" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <Label>Deadline *</Label>
            <Input value={deadlineAt} onChange={(e) => setDeadlineAt(e.target.value)} type="date" />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="soft" onClick={() => router.push("/dashboard/company/jobs")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}

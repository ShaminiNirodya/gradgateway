"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

// Comprehensive skills list (same as talent search)
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

export default function NewCompanyJobPage() {
  const router = useRouter();
  const { show } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunityType, setOpportunityType] = useState("Internship");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [skillSearch, setSkillSearch] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [monthlyStipendLkr, setMonthlyStipendLkr] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");

  const selectedSkillsText = useMemo(() => Array.from(selectedSkills).join(", "), [selectedSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || selectedSkills.size === 0 || !deadlineAt) {
      show({ title: "Missing fields", description: "Please fill all required fields.", variant: "warning" });
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
      if (!token) {
        throw new Error("Please sign in again.");
      }

      await DashboardService.createCompanyOpportunity(token, {
        title: title.trim(),
        description: description.trim(),
        opportunityType,
        workMode,
        location: location.trim(),
        requiredSkills: selectedSkillsText,
        monthlyStipendLkr: monthlyStipendLkr.trim() ? Number(monthlyStipendLkr) : null,
        deadlineAt: deadlineDate.toISOString(),
      });

      show({ title: "Job posted", description: "Your new job post is now live.", variant: "success" });
      router.push("/dashboard/company/jobs");
      router.refresh();
    } catch (error: any) {
      show({ title: "Post failed", description: error?.message || "Unable to create job post.", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Create Job Post</h1>
        <p className="text-sm text-slate-500 mt-1">Publish a new position for students.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div className="space-y-2">
          <Label>Job Title *</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. QA Engineer Intern" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Opportunity Type *</Label>
            <select value={opportunityType} onChange={(event) => setOpportunityType(event.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option>Internship</option>
              <option>GraduateRole</option>
              <option>PartTime</option>
              <option>FullTime</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Work Mode *</Label>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option>Onsite</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location *</Label>
          <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Colombo" />
        </div>

        <div className="space-y-2">
          <Label>Description *</Label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
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
                className="w-full justify-start text-left font-normal h-auto min-h-[40px] py-2"
              >
                {selectedSkills.size > 0 
                  ? `${selectedSkills.size} skill${selectedSkills.size > 1 ? 's' : ''} selected` 
                  : "Select required skills..."}
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
                  .filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
                  .map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={selectedSkills.has(skill)}
                        onCheckedChange={(checked) => toggleSkill(skill)}
                      />
                      <span className="text-slate-700">{skill}</span>
                    </label>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedSkills.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(selectedSkills).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="hover:bg-indigo-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Monthly Stipend (LKR)</Label>
            <Input value={monthlyStipendLkr} onChange={(event) => setMonthlyStipendLkr(event.target.value)} placeholder="e.g. 120000" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <Label>Deadline *</Label>
            <Input value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} type="date" />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/company/jobs")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting..." : "Post Job"}</Button>
        </div>
      </form>
    </div>
  );
}

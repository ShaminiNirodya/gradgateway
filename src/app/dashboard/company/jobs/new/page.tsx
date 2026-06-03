"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { JobPositionPicker } from "@/components/shared/JobPositionPicker";
import {
  appendJobCategoryToDescription,
  buildPostedJobTitle,
  isOtherJobCategory,
} from "@/lib/constants/job-positions";

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

const ONLINE_LOCATION = "Remote (Online)";

function workModeNeedsLocationInput(mode: string): boolean {
  return mode === "Hybrid";
}

function isOnlineWorkMode(mode: string): boolean {
  return mode === "Remote";
}

export default function NewCompanyJobPage() {
  const router = useRouter();
  const { show } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jobCategoryId, setJobCategoryId] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [otherPositionName, setOtherPositionName] = useState("");
  const [otherPositionDetails, setOtherPositionDetails] = useState("");
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

  const locationDisabled = isOnlineWorkMode(workMode);
  const locationRequired = workModeNeedsLocationInput(workMode);

  useEffect(() => {
    if (isOnlineWorkMode(workMode)) {
      setLocation(ONLINE_LOCATION);
    } else if (location === ONLINE_LOCATION) {
      setLocation("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to work mode changes
  }, [workMode]);

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

    const title = buildPostedJobTitle(jobCategoryId, jobPosition, otherPositionName);

    if (!jobCategoryId) {
      show({ title: "Missing category", description: "Select a job category.", variant: "warning" });
      return;
    }

    if (isOtherJobCategory(jobCategoryId)) {
      if (!otherPositionName.trim() || !otherPositionDetails.trim()) {
        show({
          title: "Missing custom role",
          description: "Enter a position name and role details for Other.",
          variant: "warning",
        });
        return;
      }
    } else if (!jobPosition.trim()) {
      show({ title: "Missing position", description: "Select a job position.", variant: "warning" });
      return;
    }

    if (locationRequired && !location.trim()) {
      show({
        title: "Missing location",
        description: "Hybrid roles require a work location.",
        variant: "warning",
      });
      return;
    }

    if (selectedSkills.size === 0 || !deadlineAt) {
      show({ title: "Missing fields", description: "Please fill all required fields.", variant: "warning" });
      return;
    }

    const resolvedLocation = isOnlineWorkMode(workMode)
      ? ONLINE_LOCATION
      : location.trim() || "Not specified";

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

      const descriptionText = description.trim() || "No description provided.";
      await DashboardService.createCompanyOpportunity(token, {
        title,
        description: appendJobCategoryToDescription(
          descriptionText,
          jobCategoryId,
          otherPositionDetails
        ),
        opportunityType,
        workMode,
        location: resolvedLocation,
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
        <JobPositionPicker
          categoryId={jobCategoryId}
          position={jobPosition}
          otherPositionName={otherPositionName}
          otherPositionDetails={otherPositionDetails}
          onCategoryChange={setJobCategoryId}
          onPositionChange={setJobPosition}
          onOtherPositionNameChange={setOtherPositionName}
          onOtherPositionDetailsChange={setOtherPositionDetails}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Opportunity Type *</Label>
            <select value={opportunityType} onChange={(event) => setOpportunityType(event.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="Internship">Internship</option>
              <option value="GraduateRole">Graduate Role</option>
              <option value="PartTime">Part Time</option>
              <option value="Contract">Full Time</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Work Mode *</Label>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="Onsite">Onsite</option>
              <option value="Remote">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Location{locationRequired ? " *" : ""}
          </Label>
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder={locationDisabled ? "Set automatically for online roles" : "e.g. Colombo"}
            disabled={locationDisabled}
            className={cn(locationDisabled && "bg-slate-100 text-slate-500 cursor-not-allowed")}
          />
          {locationDisabled ? (
            <p className="text-xs text-slate-500 ml-1">Online roles use a default remote location.</p>
          ) : locationRequired ? (
            <p className="text-xs text-slate-500 ml-1">Required for hybrid roles.</p>
          ) : (
            <p className="text-xs text-slate-500 ml-1">Optional for onsite roles.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
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
                className={cn(
                  "w-full min-h-10 h-auto justify-between gap-2 rounded-xl border-slate-200 py-2 pl-3 pr-2 text-left font-normal hover:bg-slate-50",
                  selectedSkills.size > 0 && "items-start"
                )}
              >
                {selectedSkills.size === 0 ? (
                  <span className="text-slate-500">Select required skills...</span>
                ) : (
                  <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {Array.from(selectedSkills).map((skill) => (
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
                            toggleSkill(skill);
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
          <Button type="button" variant="soft" onClick={() => router.push("/dashboard/company/jobs")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting..." : "Post Job"}</Button>
        </div>
      </form>
    </div>
  );
}

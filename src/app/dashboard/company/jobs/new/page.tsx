"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobPositionPicker } from "@/components/shared/JobPositionPicker";
import { SkillsPicker } from "@/components/shared/SkillsPicker";
import {
  appendJobCategoryToDescription,
  buildPostedJobTitle,
  isOtherJobCategory,
} from "@/lib/constants/job-positions";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import { CompanyPageHeader } from "@/components/layout/company/CompanyPageHeader";

const DESCRIPTION_MAX = 2000;

const ONLINE_LOCATION = "Remote (Online)";

const OPPORTUNITY_TYPES = [
  { value: "Internship", label: "Internship" },
  { value: "GraduateRole", label: "Graduate role" },
  { value: "PartTime", label: "Part time" },
  { value: "Contract", label: "Full time" },
] as const;

const WORK_MODES = [
  { value: "Onsite", label: "Onsite", hint: "Office-based" },
  { value: "Remote", label: "Online", hint: "Fully remote" },
  { value: "Hybrid", label: "Hybrid", hint: "Mix of both" },
] as const;

function workModeNeedsLocationInput(mode: string): boolean {
  return mode === "Hybrid";
}

function isOnlineWorkMode(mode: string): boolean {
  return mode === "Remote";
}

function formatOpportunityTypeLabel(type: string): string {
  return OPPORTUNITY_TYPES.find((t) => t.value === type)?.label ?? type;
}

function formatWorkModeLabel(mode: string): string {
  return WORK_MODES.find((m) => m.value === mode)?.label ?? mode;
}

function formatStipend(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (Number.isNaN(num)) return null;
  return `LKR ${num.toLocaleString("en-LK")}/mo`;
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
  const [monthlyStipendLkr, setMonthlyStipendLkr] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");

  const previewTitle = useMemo(
    () => buildPostedJobTitle(jobCategoryId, jobPosition, otherPositionName),
    [jobCategoryId, jobPosition, otherPositionName]
  );

  const resolvedLocation = isOnlineWorkMode(workMode)
    ? ONLINE_LOCATION
    : location.trim() || "Location TBD";

  const locationDisabled = isOnlineWorkMode(workMode);
  const locationRequired = workModeNeedsLocationInput(workMode);

  const roleComplete = useMemo(() => {
    if (!jobCategoryId) return false;
    if (isOtherJobCategory(jobCategoryId)) {
      return Boolean(otherPositionName.trim() && otherPositionDetails.trim());
    }
    return Boolean(jobPosition.trim());
  }, [jobCategoryId, jobPosition, otherPositionName, otherPositionDetails]);

  const completionSteps = useMemo(() => {
    const locationOk = !locationRequired || Boolean(location.trim());
    return [
      { label: "Role", done: roleComplete },
      { label: "Work setup", done: locationOk },
      { label: "Skills", done: selectedSkills.size > 0 },
      { label: "Deadline", done: Boolean(deadlineAt) },
    ];
  }, [roleComplete, locationRequired, location, selectedSkills.size, deadlineAt]);

  const completionPercent = Math.round(
    (completionSteps.filter((s) => s.done).length / completionSteps.length) * 100
  );

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

    const finalLocation = isOnlineWorkMode(workMode)
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
        location: finalLocation,
        requiredSkills: Array.from(selectedSkills).join(", "),
        monthlyStipendLkr: monthlyStipendLkr.trim() ? Number(monthlyStipendLkr) : null,
        deadlineAt: deadlineDate.toISOString(),
      });

      show({ title: "Job posted", description: "Your new job post is now live.", variant: "success" });
      router.push("/dashboard/company/jobs");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to create job post.";
      show({ title: "Post failed", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-11 rounded-xl border-slate-200/80 bg-white shadow-sm focus-visible:border-[#6C5DD3]/40 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20";

  return (
    <CompanyPageContainer>
      <CompanyPageHeader
        eyebrow="Job posts"
        title="Create job post"
        subtitle="Publish a new opening for students and graduates on GradGateway."
        showSearch={false}
        showNotifications={false}
        primaryAction={
          <Button asChild variant="outline" className="rounded-xl border-slate-200 font-semibold">
            <Link href="/dashboard/company/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to jobs
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles className="h-4 w-4 text-[#6C5DD3]" />
                Form progress
              </div>
              <span className="text-sm font-bold tabular-nums text-[#6C5DD3]">{completionPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C5DD3] to-indigo-400 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {completionSteps.map((step) => (
                <span
                  key={step.label}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    step.done
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          <FormSection
            icon={<Briefcase className="h-4 w-4" />}
            title="Role details"
            description="Choose the category and position students will see in search."
          >
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
          </FormSection>

          <FormSection
            icon={<MapPin className="h-4 w-4" />}
            title="Work arrangement"
            description="How and where the role will be performed."
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Opportunity type *</Label>
                <OptionPills
                  options={OPPORTUNITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                  value={opportunityType}
                  onChange={setOpportunityType}
                />
              </div>

              <div className="space-y-2">
                <Label>Work mode *</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {WORK_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setWorkMode(mode.value)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition-all",
                        workMode === mode.value
                          ? "border-[#6C5DD3] bg-[#6C5DD3]/5 ring-2 ring-[#6C5DD3]/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <span className="block text-sm font-bold text-slate-800">{mode.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{mode.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Location{locationRequired ? " *" : ""}
                </Label>
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder={locationDisabled ? "Set automatically for online roles" : "e.g. Colombo, Kandy"}
                  disabled={locationDisabled}
                  className={cn(
                    inputClass,
                    locationDisabled && "cursor-not-allowed bg-slate-100 text-slate-500"
                  )}
                />
                <p className="text-xs text-slate-500">
                  {locationDisabled
                    ? "Online roles are listed as remote automatically."
                    : locationRequired
                      ? "Required for hybrid roles — city or office area."
                      : "Optional for onsite roles."}
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<FileText className="h-4 w-4" />}
            title="Role description"
            description="Help candidates understand responsibilities and what you expect."
          >
            <div className="space-y-2">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, DESCRIPTION_MAX))}
                className={cn(
                  "min-h-[140px] w-full resize-y rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm shadow-sm",
                  "placeholder:text-slate-400 focus-visible:border-[#6C5DD3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
                )}
                placeholder="Describe day-to-day work, team structure, and ideal candidate traits..."
              />
              <p className="text-right text-xs text-slate-400">
                {description.length}/{DESCRIPTION_MAX}
              </p>
            </div>
          </FormSection>

          <FormSection
            icon={<Wrench className="h-4 w-4" />}
            title="Required skills"
            description="Pick skills students can filter by when browsing openings."
          >
            <SkillsPicker
              selected={selectedSkills}
              onToggle={toggleSkill}
              required
              placeholder="Search React, Python, AWS, Docker..."
            />
          </FormSection>

          <FormSection
            icon={<Wallet className="h-4 w-4" />}
            title="Compensation & deadline"
            description="Set expectations and when applications close."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Monthly stipend (LKR)</Label>
                <Input
                  value={monthlyStipendLkr}
                  onChange={(event) => setMonthlyStipendLkr(event.target.value)}
                  placeholder="e.g. 120000"
                  type="number"
                  min="0"
                  className={inputClass}
                />
                <p className="text-xs text-slate-500">Optional — leave blank if undisclosed.</p>
              </div>
              <div className="space-y-2">
                <Label>Application deadline *</Label>
                <Input
                  value={deadlineAt}
                  onChange={(event) => setDeadlineAt(event.target.value)}
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                />
                <p className="text-xs text-slate-500">Students cannot apply after this date.</p>
              </div>
            </div>
          </FormSection>

          <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end xl:static xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none xl:backdrop-blur-none">
            <Button
              type="button"
              variant="soft"
              className="rounded-xl"
              onClick={() => router.push("/dashboard/company/jobs")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || completionPercent < 100}
              className="rounded-xl bg-[#6C5DD3] font-semibold hover:bg-[#5b4eb8]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Publish job post"
              )}
            </Button>
          </div>
        </form>

        <aside className="xl:sticky xl:top-6">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Live preview</p>
            <JobPreviewCard
              title={previewTitle || "Your job title"}
              opportunityType={opportunityType}
              workMode={workMode}
              location={resolvedLocation}
              description={description}
              skills={Array.from(selectedSkills)}
              stipend={formatStipend(monthlyStipendLkr)}
              deadline={deadlineAt}
              hasRole={roleComplete}
            />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-indigo-900">
              <p className="font-semibold">Tips for a strong post</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-indigo-800/90">
                <li>Use a clear position title students recognize.</li>
                <li>List 3–6 core skills — not every technology you use.</li>
                <li>Mention stipend or mark it optional to reduce drop-off.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </CompanyPageContainer>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3]">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function OptionPills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            value === option.value
              ? "bg-[#6C5DD3] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function JobPreviewCard({
  title,
  opportunityType,
  workMode,
  location,
  description,
  skills,
  stipend,
  deadline,
  hasRole,
}: {
  title: string;
  opportunityType: string;
  workMode: string;
  location: string;
  description: string;
  skills: string[];
  stipend: string | null;
  deadline: string;
  hasRole: boolean;
}) {
  const deadlineLabel = deadline
    ? new Date(`${deadline}T12:00:00`).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-[#6C5DD3] via-indigo-400 to-violet-400" />
      <div className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-[#6C5DD3] ring-1 ring-indigo-100/80">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Preview
            </span>
            <h3
              className={cn(
                "mt-1 line-clamp-2 text-base font-extrabold leading-snug",
                hasRole ? "text-slate-800" : "text-slate-400"
              )}
            >
              {title}
            </h3>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          <PreviewChip icon={<Briefcase className="h-3 w-3" />} label={formatOpportunityTypeLabel(opportunityType)} />
          <PreviewChip icon={<MapPin className="h-3 w-3" />} label={location} />
          <PreviewChip icon={<Clock className="h-3 w-3" />} label={formatWorkModeLabel(workMode)} />
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {description.trim() || "Your role description will appear here for students browsing openings."}
        </p>

        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stipend</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{stipend ?? "Not listed"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <Calendar className="h-3 w-3" />
              Deadline
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{deadlineLabel}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function PreviewChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

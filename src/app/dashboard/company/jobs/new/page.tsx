"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { StudentService } from "@/lib/services/student.service";

export default function NewCompanyJobPage() {
  const router = useRouter();
  const { show } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunityType, setOpportunityType] = useState("Internship");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [location, setLocation] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [monthlyStipendLkr, setMonthlyStipendLkr] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setAvailableSkills([]);
          return;
        }

        const rows = await StudentService.getStudentDirectory(token);
        const uniqueSkills = Array.from(
          new Set(
            rows
              .flatMap((row) => (row.skills || "").split(","))
              .map((skill) => skill.trim())
              .filter(Boolean)
          )
        ).sort();

        setAvailableSkills(uniqueSkills);
      } catch {
        setAvailableSkills([]);
      }
    };

    loadSkills();
  }, []);

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
          <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => {
                const selected = selectedSkills.has(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${selected ? "bg-[#6C5DD3] text-white border-[#6C5DD3]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#6C5DD3]/40"}`}
                  >
                    {skill}
                  </button>
                );
              })}
              {availableSkills.length === 0 && (
                <p className="text-sm text-slate-500">No skills found from talent directory yet.</p>
              )}
            </div>
            <Input value={selectedSkillsText} readOnly placeholder="Select required skills from the list" />
          </div>
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

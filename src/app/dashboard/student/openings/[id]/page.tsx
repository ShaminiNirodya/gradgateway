"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { OpportunityItem } from "@/lib/types/dashboard";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const [job, setJob] = useState<OpportunityItem | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const detail = await DashboardService.getOpportunityById(id);
        setJob(detail);

        const token = await AuthService.getIdToken();
        if (token) {
          const myApps = await DashboardService.getMyApplications(token);
          setHasApplied(myApps.some((app) => app.opportunityId === id));
        }
      } catch {
        setJob(null);
      }
    };

    load();
  }, [id]);

  const skills = useMemo(
    () =>
      (job?.requiredSkills || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [job?.requiredSkills]
  );

  const salary = useMemo(() => {
    if (!job?.monthlyStipendLkr) return "Negotiable";
    return `LKR ${job.monthlyStipendLkr.toLocaleString()}`;
  }, [job?.monthlyStipendLkr]);

  const apply = async () => {
    if (!job || hasApplied || isApplying) return;
    try {
      setIsApplying(true);
      const token = await AuthService.getIdToken();
      if (!token) throw new Error("Please log in again.");
      await DashboardService.applyToOpportunity(token, job.id);
      setHasApplied(true);
      show({
        title: "Application Sent!",
        description: `Your application for ${job.title} has been submitted.`,
        variant: "success",
      });
    } catch (error: any) {
      show({ title: "Apply failed", description: error?.message || "Unable to submit application.", variant: "error" });
    } finally {
      setIsApplying(false);
    }
  };

  if (!job) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Opportunity not found</h2>
        <Button onClick={() => router.push("/dashboard/student/openings")}>Back to Openings</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-[#6C5DD3] transition-colors font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Openings
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          {job.companyLogoUrl ? (
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="w-20 h-20 rounded-2xl shadow-md object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl shadow-md bg-[#6C5DD3] flex items-center justify-center text-white text-2xl font-bold">
              {job.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg font-semibold">{job.companyName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoBadge icon={<MapPin className="w-4 h-4" />} label="Location" value={job.location} />
              <InfoBadge icon={<Briefcase className="w-4 h-4" />} label="Job Type" value={job.opportunityType} />
              <InfoBadge icon={<DollarSign className="w-4 h-4" />} label="Salary" value={salary} />
              <InfoBadge icon={<Calendar className="w-4 h-4" />} label="Deadline" value={new Date(job.deadlineAt).toLocaleDateString("en-LK")} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button
            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5B4EC3] px-8 flex-1 sm:flex-none h-12 text-base font-semibold shadow-lg shadow-indigo-200"
            onClick={apply}
            disabled={hasApplied || isApplying}
          >
            {hasApplied ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Application Submitted
              </>
            ) : (
              "Apply Now"
            )}
          </Button>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString("en-LK")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Job Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="px-3 py-2 bg-[#6C5DD3]/10 text-[#6C5DD3] text-sm font-semibold rounded-lg">
                  {skill}
                </span>
              ))}
              {skills.length === 0 && <span className="text-sm text-slate-500">No skills listed.</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoBadge({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

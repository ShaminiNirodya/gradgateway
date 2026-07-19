"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { CompanyService } from "@/lib/services/company.service";
import type { CompanyPublicProfile } from "@/lib/types/company";
import { cn } from "@/lib/utils";

export default function StudentCompanyProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyProfileId = searchParams.get("id") || "";
  const returnToOpening = searchParams.get("fromOpening") || "";

  const [profile, setProfile] = useState<CompanyPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!companyProfileId) {
        setError("Company not specified.");
        setLoading(false);
        return;
      }

      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setError("Please sign in to view company profiles.");
          setLoading(false);
          return;
        }

        let data: CompanyPublicProfile | null = null;
        let lastError = "Could not load company profile.";

        if (returnToOpening) {
          try {
            data = await CompanyService.getPublicCompanyProfileByOpportunity(token, returnToOpening);
          } catch (err: unknown) {
            lastError = err instanceof Error ? err.message : lastError;
          }
        }

        if (!data && companyProfileId) {
          try {
            data = await CompanyService.getPublicCompanyProfile(token, companyProfileId);
          } catch (err: unknown) {
            lastError = err instanceof Error ? err.message : lastError;
          }
        }

        if (!data) {
          setProfile(null);
          setError(lastError);
        } else {
          setProfile(data);
          setError(null);
        }
      } catch (err: unknown) {
        setProfile(null);
        setError(err instanceof Error ? err.message : "Could not load company profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyProfileId, returnToOpening]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-500">Loading company profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#6C5DD3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
          <p className="font-bold text-slate-800">{error || "Company not found"}</p>
          <Button asChild variant="outline" className="mt-4 rounded-lg">
            <Link href="/dashboard/student/openings">Browse openings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const initial = profile.companyName.trim().charAt(0).toUpperCase() || "C";
  const websiteHref = profile.website
    ? profile.website.startsWith("http")
      ? profile.website
      : `https://${profile.website}`
    : null;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() =>
          returnToOpening
            ? router.push(`/dashboard/student/openings/${returnToOpening}`)
            : router.back()
        }
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#6C5DD3]"
      >
        <ArrowLeft className="h-4 w-4" />
        {returnToOpening ? "Back to job listing" : "Back"}
      </button>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {profile.logoDataUrl ? (
            <img
              src={profile.logoDataUrl}
              alt={profile.companyName}
              className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#6C5DD3] text-2xl font-bold text-white">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{profile.companyName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {profile.industry}
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Sri Lanka
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {profile.companyName} is hiring through GradGateway for {profile.industry.toLowerCase()} roles.
              Explore their active openings below or reach out using the contact details provided.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">Recruiter details</h2>
            <p className="mt-1 text-xs text-slate-500">Primary contact for applications and hiring questions</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField label="Recruiter name" value={profile.recruiterName} icon={<User className="h-4 w-4" />} />
              <ProfileField label="Recruiter position" value={profile.position} icon={<Briefcase className="h-4 w-4" />} />
              <ProfileField
                label="Recruiter email"
                value={profile.recruiterEmail}
                icon={<Mail className="h-4 w-4" />}
                href={`mailto:${profile.recruiterEmail}`}
              />
              <ProfileField
                label="Recruiter phone"
                value={profile.recruiterPhone}
                icon={<Phone className="h-4 w-4" />}
                href={`tel:${profile.recruiterPhone}`}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Open roles</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {profile.activeOpeningsCount} active opening
                  {profile.activeOpeningsCount === 1 ? "" : "s"}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <Link href="/dashboard/student/openings">All openings</Link>
              </Button>
            </div>

            {profile.openings.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">No active job posts at the moment.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
                {profile.openings.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/dashboard/student/openings/${job.id}`}
                      className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-500">
                          {job.location} · {job.opportunityType} · {job.workMode}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                        <span>
                          {job.monthlyStipendLkr
                            ? `LKR ${job.monthlyStipendLkr.toLocaleString()}`
                            : "Salary negotiable"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Deadline {new Date(job.deadlineAt).toLocaleDateString("en-LK")}
                        </span>
                        <ExternalLink className="h-4 w-4 text-[#6C5DD3]" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">Company contact</h2>
            <div className="mt-4 space-y-4">
              <ContactRow icon={<Mail className="h-4 w-4" />} label="Company email" value={profile.companyEmail} href={`mailto:${profile.companyEmail}`} />
              <ContactRow icon={<Phone className="h-4 w-4" />} label="Company phone" value={profile.phone} href={`tel:${profile.phone}`} />
              {websiteHref ? (
                <ContactRow icon={<Globe className="h-4 w-4" />} label="Website" value={profile.website!} href={websiteHref} external />
              ) : (
                <ContactRow icon={<Globe className="h-4 w-4" />} label="Website" value="Not provided" />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
            <h3 className="text-sm font-bold text-slate-800">Hiring on GradGateway</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Apply to individual roles from the list, or message the company after you have applied to start a
              conversation.
            </p>
            <Button asChild className="mt-4 w-full rounded-lg bg-[#6C5DD3] hover:bg-[#5b4eb8]">
              <Link href="/dashboard/student/messages">Go to messages</Link>
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-800">
      <span className="text-slate-400">{icon}</span>
      <span className="min-w-0 truncate">{value || "—"}</span>
    </div>
  );

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-800">{label}</p>
      {href && value ? (
        <a href={href} className="block transition-colors hover:border-[#6C5DD3]/40">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#6C5DD3] hover:underline"
          )}
        >
          {value}
          {external && <ExternalLink className="h-3.5 w-3.5" />}
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
      )}
    </div>
  );
}

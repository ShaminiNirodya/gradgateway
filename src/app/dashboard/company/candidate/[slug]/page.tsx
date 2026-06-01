"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Calendar, Mail, Briefcase, BookOpen, Download } from "lucide-react";
import SendOfferButton from "@/components/features/company/SendOfferButton";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem } from "@/lib/types/dashboard";

type DirectoryCandidate = {
  studentProfileId: string;
  fullName: string;
  university: string;
  degree: string;
  gradYear: number;
  currentYear: number;
  gpa: number;
  email: string;
  skills: string;
  photoDataUrl?: string;
  availability: string;
};

export default function CandidateProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params?.slug || "");
  const candidateId = searchParams.get("id") || "";
  const candidateEmail = searchParams.get("email") || "";

  const [candidate, setCandidate] = useState<DirectoryCandidate | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;

        const [directory, companyApps] = await Promise.all([
          StudentService.getStudentDirectory(token),
          DashboardService.getCompanyApplications(token),
        ]);

        setApplications(companyApps);

        const slugName = slug.replace(/-/g, " ").toLowerCase();
        const found = directory.find((item) =>
          (candidateId && item.studentProfileId === candidateId) ||
          (candidateEmail && item.email.toLowerCase() === candidateEmail.toLowerCase()) ||
          item.fullName.toLowerCase() === slugName
        );

        setCandidate(found || null);
      } catch {
        setCandidate(null);
        setApplications([]);
      }
    };

    load();
  }, [candidateEmail, candidateId, slug]);

  const skillList = useMemo(
    () => (candidate?.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean),
    [candidate?.skills]
  );

  const candidateApps = useMemo(
    () => applications.filter((item) => item.studentEmail.toLowerCase() === (candidate?.email || "").toLowerCase()),
    [applications, candidate?.email]
  );

  if (!candidate) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Candidate not found</h2>
        <p className="text-sm text-slate-500 mt-2">This profile could not be mapped from current company data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <section className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 flex-shrink-0 border-4 border-white shadow-xl">
                {candidate.photoDataUrl && <AvatarImage src={candidate.photoDataUrl} alt={candidate.fullName} />}
                <AvatarFallback>{candidate.fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{candidate.fullName}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-400" /> {candidate.university}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Class of {candidate.gradYear}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {candidate.email}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase tracking-wider">{candidate.degree}</Badge>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase tracking-wider">GPA {candidate.gpa.toFixed(2)}</Badge>
                  <Badge className={
                    candidate.availability === "Available Now" ? "bg-emerald-50 text-emerald-600 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase tracking-wider" :
                    candidate.availability === "Actively Looking" ? "bg-blue-50 text-blue-600 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase tracking-wider" :
                    candidate.availability === "Open to Offers" ? "bg-amber-50 text-amber-600 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase tracking-wider" :
                    "bg-slate-50 text-slate-600 border-none rounded-lg px-3 py-1 font-bold text-xs uppercase tracking-wider"
                  }>{candidate.availability}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" /> Download CV
              </Button>
              <SendOfferButton candidateName={candidate.fullName} studentProfileId={candidate.studentProfileId} />
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill) => (
                  <Badge key={skill} variant="secondary" className="rounded-xl">{skill}</Badge>
                ))}
                {!skillList.length && <span className="text-sm text-slate-500">No skills listed yet.</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Applications</h3>
              <div className="space-y-2">
                {candidateApps.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.jobTitle}</p>
                      <p className="text-xs text-slate-500">{new Date(item.appliedAt).toLocaleDateString("en-LK")}</p>
                    </div>
                    <Badge className="bg-white text-slate-700 border border-slate-200">{item.status}</Badge>
                  </div>
                ))}
                {!candidateApps.length && <p className="text-sm text-slate-500">No applications found for this candidate yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Profile Summary</h4>
          <div className="space-y-4">
            <ProfileStat label="Applications" value={String(candidateApps.length)} />
            <ProfileStat label="Top Skill" value={skillList[0] || "N/A"} />
            <ProfileStat label="Academic Year" value={String(candidate.gradYear)} />
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Education</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[#6C5DD3]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">{candidate.university}</p>
                <p className="text-xs text-slate-500">{candidate.degree}</p>
                <p className="text-xs text-slate-400">Graduation Year: {candidate.gradYear}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

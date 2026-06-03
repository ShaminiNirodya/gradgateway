"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    DollarSign,
    Building2,
    Filter,
    ChevronDown,
    TrendingUp,
    Loader2,
    Users,
    CheckCircle2,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { companyProfilePath } from "@/lib/utils/slug";
import { useToast } from "@/components/ui/toast";
import { DashboardService } from "@/lib/services/dashboard.service";
import { AuthService } from "@/lib/services/auth.service";
import { OpportunityItem } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";
import { StudentPageHero } from "@/components/layout/student/StudentPageHero";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getJobCategoryById,
  isOtherJobCategory,
  jobTitleMatchesCategory,
  jobTitleMatchesPosition,
  JOB_POSITION_CATEGORIES,
} from "@/lib/constants/job-positions";
import { isExpiredJobOpening } from "@/lib/utils/job-deadline";

type JobCardModel = {
    id: string;
    companyProfileId: string;
    title: string;
    description: string;
    company: string;
    logo: string;
    location: string;
    type: string;
    salary: string;
    postedDate: string;
    applicants: number;
    skills: string[];
    remote: boolean;
};

const jobTypes = ["All Jobs", "Internships", "Full-time", "Part-time", "Contract"];
export default function OpeningsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedJobType, setSelectedJobType] = useState("All Jobs");
    const [selectedJobCategoryId, setSelectedJobCategoryId] = useState("");
    const [selectedJobPosition, setSelectedJobPosition] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filtersResetKey, setFiltersResetKey] = useState(0);
    const [jobs, setJobs] = useState<JobCardModel[]>([]);
    const [expiredOpeningsCount, setExpiredOpeningsCount] = useState(0);
    const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
    /** Applications submitted to job openings (includes expired roles). */
    const [appliedOpeningsCount, setAppliedOpeningsCount] = useState(0);

    const { show } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [{ active: openings, expiredCount }, token] = await Promise.all([
                    DashboardService.getStudentOpeningsFeed(),
                    AuthService.getIdToken(),
                ]);

                let resolvedExpiredCount = expiredCount;

                const mapped = openings.map((job: OpportunityItem) => ({
                    id: job.id,
                    companyProfileId: job.companyProfileId,
                    title: job.title,
                    description: job.description,
                    company: job.companyName,
                    logo: job.companyLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName)}&background=6C5DD3&color=fff&size=200`,
                    location: job.location,
                    type: job.opportunityType,
                    salary: job.monthlyStipendLkr ? `LKR ${job.monthlyStipendLkr.toLocaleString()}` : "Negotiable",
                    postedDate: new Date(job.createdAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
                    applicants: 0,
                    skills: (job.requiredSkills || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    remote: (job.workMode || "").toLowerCase().includes("remote"),
                }));

                setJobs(mapped);

                if (token) {
                    try {
                        const myApps = await DashboardService.getMyApplications(token);
                        const openingApplications = myApps.filter((a) => a.opportunityId);
                        setAppliedOpeningsCount(openingApplications.length);
                        const appliedIds = openingApplications
                            .map((a) => a.opportunityId)
                            .filter((id): id is string => Boolean(id));
                        setAppliedJobIds(appliedIds);

                        if (resolvedExpiredCount === 0 && appliedIds.length > 0) {
                            const activeIds = new Set(openings.map((o) => o.id));
                            const notInActiveFeed = [
                                ...new Set(appliedIds.filter((id) => !activeIds.has(id))),
                            ];
                            let inferredExpired = 0;
                            for (const id of notInActiveFeed) {
                                try {
                                    const opp = await DashboardService.getOpportunityById(id);
                                    if (isExpiredJobOpening(opp)) inferredExpired += 1;
                                } catch {
                                    /* skip missing roles */
                                }
                            }
                            if (inferredExpired > 0) {
                                resolvedExpiredCount = inferredExpired;
                            }
                        }
                    } catch {
                        setAppliedOpeningsCount(0);
                        setAppliedJobIds([]);
                    }
                } else {
                    setAppliedOpeningsCount(0);
                    setAppliedJobIds([]);
                }

                setExpiredOpeningsCount(resolvedExpiredCount);
            } catch {
                setJobs([]);
                setExpiredOpeningsCount(0);
                setAppliedJobIds([]);
                setAppliedOpeningsCount(0);
            }
        };

        load();
    }, []);

    const applyToJob = async (job: JobCardModel) => {
        try {
            const token = await AuthService.getIdToken();
            if (!token) throw new Error("Please log in again.");
            await DashboardService.applyToOpportunity(token, job.id);
            setAppliedJobIds((prev) => {
                if (prev.includes(job.id)) return prev;
                setAppliedOpeningsCount((count) => count + 1);
                return [...prev, job.id];
            });
            show({ title: "Application Sent!", description: `Your application for ${job.title} at ${job.company} has been submitted.`, variant: "success" });
        } catch (error: any) {
            show({ title: "Apply failed", description: error?.message || "Unable to submit application.", variant: "error" });
        }
    };

    const openingStats = useMemo(() => {
        // Total Openings: all active posts (applied or not).
        const totalOpenings = jobs.length;
        // Moved to Applications: student's applications to job openings.
        const movedToApplications = appliedOpeningsCount;
        // Available Now: active posts the student has not applied to.
        const availableNow = jobs.filter((job) => !appliedJobIds.includes(job.id)).length;
        // Expired: inactive or past-deadline posts (applied or not), from API.
        const expired = expiredOpeningsCount;
        return { totalOpenings, movedToApplications, availableNow, expired };
    }, [jobs, appliedJobIds, appliedOpeningsCount, expiredOpeningsCount]);

    const filteredJobs = useMemo(() => jobs.filter((job) => {
        // Hide jobs that have already been applied for
        if (appliedJobIds.includes(job.id)) return false;

        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.skills.some((skill) =>
                skill.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesJobType =
            selectedJobType === "All Jobs" ||
            (selectedJobType === "Internships" && job.type === "Internship") ||
            (selectedJobType === "Full-time" && job.type === "GraduateRole") ||
            (selectedJobType === "Part-time" && job.type === "PartTime") ||
            (selectedJobType === "Contract" && job.type === "Contract") ||
            job.type === selectedJobType;

        const matchesJobPosition =
            !selectedJobCategoryId ||
            (selectedJobPosition
                ? jobTitleMatchesPosition(job.title, selectedJobPosition)
                : jobTitleMatchesCategory(job.title, selectedJobCategoryId, job.description));

        return matchesSearch && matchesJobType && matchesJobPosition;
    }), [jobs, appliedJobIds, searchQuery, selectedJobType, selectedJobCategoryId, selectedJobPosition]);

    const filterCategory = selectedJobCategoryId ? getJobCategoryById(selectedJobCategoryId) : undefined;

    const hasActiveFilters =
        !!searchQuery.trim() ||
        selectedJobType !== "All Jobs" ||
        !!selectedJobCategoryId ||
        !!selectedJobPosition;

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedJobType("All Jobs");
        setSelectedJobCategoryId("");
        setSelectedJobPosition("");
        setFiltersResetKey((key) => key + 1);
        show({ title: "Filters cleared", description: "Showing all available openings.", variant: "success" });
    };

    return (
        <StudentPageContainer>
            <StudentPageHero
                eyebrow="Career"
                title="Job Openings"
                description="Discover your next opportunity from top companies"
            />

            <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by job title, company, or skills..."
                        className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white pl-12 text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:border-[#6C5DD3]/40 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button
                    variant="soft"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-12 shrink-0 px-5"
                >
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                    <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showFilters && "rotate-180")} />
                </Button>
            </div>

            {showFilters && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-700">Refine results</p>
                            <Button
                                type="button"
                                variant="softSurface"
                                size="sm"
                                disabled={!hasActiveFilters}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    clearFilters();
                                }}
                            >
                                <X className="h-4 w-4" />
                                Clear filters
                            </Button>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Job Type</label>
                            <div className="flex flex-wrap gap-2">
                                {jobTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedJobType(type)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedJobType === type ? "bg-[#6C5DD3] text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Job category</Label>
                                <Select
                                    key={`job-category-${filtersResetKey}`}
                                    value={selectedJobCategoryId || "all"}
                                    onValueChange={(value) => {
                                        setSelectedJobCategoryId(value === "all" ? "" : value);
                                        setSelectedJobPosition("");
                                    }}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200/80 bg-white">
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72 rounded-xl bg-white">
                                        <SelectItem value="all">All categories</SelectItem>
                                        {JOB_POSITION_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Job position</Label>
                                <Select
                                    key={`job-position-${filtersResetKey}-${selectedJobCategoryId || "none"}`}
                                    value={
                                        !selectedJobCategoryId || isOtherJobCategory(selectedJobCategoryId)
                                            ? "all"
                                            : selectedJobPosition || "all"
                                    }
                                    onValueChange={(value) => setSelectedJobPosition(value === "all" ? "" : value)}
                                    disabled={!selectedJobCategoryId || isOtherJobCategory(selectedJobCategoryId)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200/80 bg-white">
                                        <SelectValue
                                            placeholder={
                                                !selectedJobCategoryId
                                                    ? "Select a category first"
                                                    : isOtherJobCategory(selectedJobCategoryId)
                                                      ? "Custom roles only"
                                                      : "All positions"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72 rounded-xl bg-white">
                                        <SelectItem value="all">All positions</SelectItem>
                                        {filterCategory?.positions.map((pos) => (
                                            <SelectItem key={pos} value={pos}>
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                <StatCard
                    icon={<Briefcase className="h-5 w-5" />}
                    label="Total Openings"
                    value={openingStats.totalOpenings}
                    color="bg-violet-50 text-[#6C5DD3]"
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    label="Moved to Applications"
                    value={openingStats.movedToApplications}
                    color="bg-indigo-50 text-indigo-600"
                    href="/dashboard/student/applications"
                />
                <StatCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    label="Available Now"
                    value={openingStats.availableNow}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    icon={<Clock className="h-5 w-5" />}
                    label="Expired"
                    value={openingStats.expired}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            {filteredJobs.length > 0 ? (
                <section className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} appliedJobIds={appliedJobIds} applyToJob={applyToJob} />
                        ))}
                    </div>
                </section>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-lg font-extrabold text-slate-800">No openings match your filters</p>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting search or filters, or check back later.</p>
                </div>
            )}
        </StudentPageContainer>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    href?: string;
}) {
    const content = (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C5DD3]/20 hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", color)}>{icon}</div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    );
    return href ? <Link href={href}>{content}</Link> : content;
}

function JobCard({ job, appliedJobIds, applyToJob }: { job: JobCardModel; appliedJobIds: string[]; applyToJob: (job: JobCardModel) => void }) {
    const router = useRouter();
    const hasApplied = appliedJobIds.includes(job.id);
    const jobHref = `/dashboard/student/openings/${job.id}`;

    const openJob = () => router.push(jobHref);

    return (
            <div
                role="link"
                tabIndex={0}
                aria-label={`View ${job.title} at ${job.company}`}
                onClick={openJob}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openJob();
                    }
                }}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6C5DD3]/25 hover:shadow-lg"
            >
                {hasApplied && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-bl-xl z-20">Applied</div>
                )}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1">
                        <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-[#6C5DD3] transition-colors truncate">{job.title}</h3>
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                                <Building2 className="h-4 w-4 shrink-0" />
                                <Link
                                    href={companyProfilePath(job.company, job.companyProfileId)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="relative z-10 text-sm font-medium text-[#6C5DD3] hover:underline"
                                >
                                    {job.company}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{job.location}</span>
                        {job.remote && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded">Remote</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${job.type === "Internship" ? "bg-blue-50 text-blue-700" : job.type === "Full-time" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}>{job.type}</span>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-2">
                        {job.skills.map((skill: string) => (
                            <span key={skill} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3] transition-colors">{skill}</span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{job.postedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{job.applicants + (hasApplied ? 1 : 0)} applicants</span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="relative z-10 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
                        disabled={hasApplied}
                        onClick={(e) => {
                            e.stopPropagation();
                            applyToJob(job);
                        }}
                    >
                        {hasApplied ? "Applied" : "Apply Now"}
                    </Button>
                </div>
            </div>
    );
}

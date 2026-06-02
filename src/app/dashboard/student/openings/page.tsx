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
    Bookmark,
    TrendingUp,
    Users,
    Star,
    CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { DashboardService } from "@/lib/services/dashboard.service";
import { AuthService } from "@/lib/services/auth.service";
import { OpportunityItem } from "@/lib/types/dashboard";

type JobCardModel = {
    id: string;
    title: string;
    company: string;
    logo: string;
    location: string;
    type: string;
    salary: string;
    postedDate: string;
    applicants: number;
    skills: string[];
    featured: boolean;
    remote: boolean;
};

const jobTypes = ["All Jobs", "Internships", "Full-time", "Part-time", "Contract"];
const locations = ["All Locations", "Colombo", "Remote", "Kandy", "Galle"];
const jobCategories = [
    "All Positions",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Data Science",
    "Mobile Developer",
    "DevOps",
    "Product Manager",
];

export default function OpeningsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedJobType, setSelectedJobType] = useState("All Jobs");
    const [selectedLocation, setSelectedLocation] = useState("All Locations");
    const [selectedJobCategory, setSelectedJobCategory] = useState("All Positions");
    const [showFilters, setShowFilters] = useState(false);
    const [jobs, setJobs] = useState<JobCardModel[]>([]);
    const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

    const { show } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [openings, token] = await Promise.all([
                    DashboardService.getStudentOpportunities(),
                    AuthService.getIdToken(),
                ]);

                const mapped = openings.map((job: OpportunityItem, index) => ({
                    id: job.id,
                    title: job.title,
                    company: job.companyName,
                    logo: job.companyLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName)}&background=6C5DD3&color=fff&size=200`,
                    location: job.location,
                    type: job.opportunityType,
                    salary: job.monthlyStipendLkr ? `LKR ${job.monthlyStipendLkr.toLocaleString()}` : "Negotiable",
                    postedDate: new Date(job.createdAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
                    applicants: 0,
                    skills: job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
                    featured: index < 4,
                    remote: job.workMode.toLowerCase().includes("remote"),
                }));

                setJobs(mapped);

                if (token) {
                    const myApps = await DashboardService.getMyApplications(token);
                    setAppliedJobIds(myApps.map((a) => a.opportunityId));
                }
            } catch {
                setJobs([]);
                setAppliedJobIds([]);
            }
        };

        load();
    }, []);

    const applyToJob = async (job: JobCardModel) => {
        try {
            const token = await AuthService.getIdToken();
            if (!token) throw new Error("Please log in again.");
            await DashboardService.applyToOpportunity(token, job.id);
            setAppliedJobIds((prev) => (prev.includes(job.id) ? prev : [...prev, job.id]));
            show({ title: "Application Sent!", description: `Your application for ${job.title} at ${job.company} has been submitted.`, variant: "success" });
        } catch (error: any) {
            show({ title: "Apply failed", description: error?.message || "Unable to submit application.", variant: "error" });
        }
    };

    const totalOpenings = jobs.length;
    const appliedCount = appliedJobIds.length;
    const remainingCount = Math.max(0, totalOpenings - appliedCount);

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

        const matchesLocation =
            selectedLocation === "All Locations" ||
            (selectedLocation === "Remote" && job.remote) ||
            job.location.includes(selectedLocation);

        const matchesJobCategory =
            selectedJobCategory === "All Positions" ||
            job.title.toLowerCase().includes(selectedJobCategory.toLowerCase().replace(" developer", "").replace(" designer", "").replace(" manager", ""));

        return matchesSearch && matchesJobType && matchesLocation && matchesJobCategory;
    }), [jobs, appliedJobIds, searchQuery, selectedJobType, selectedLocation, selectedJobCategory]);

    const featuredJobs = filteredJobs.filter((job) => job.featured);
    const regularJobs = filteredJobs.filter((job) => !job.featured);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Job Openings</h1>
                    <p className="text-slate-600">Discover your next opportunity from top companies</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search by job title, company, or skills..."
                            className="w-full bg-white border-none rounded-2xl h-14 pl-12 text-slate-600 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                    </Button>
                </div>

                {showFilters && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
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

                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Job Position (Category)</label>
                            <div className="flex flex-wrap gap-2">
                                {jobCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedJobCategory(category)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedJobCategory === category ? "bg-[#6C5DD3] text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Location</label>
                            <div className="flex flex-wrap gap-2">
                                {locations.map((location) => (
                                    <button
                                        key={location}
                                        onClick={() => setSelectedLocation(location)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedLocation === location ? "bg-[#6C5DD3] text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                    >
                                        {location}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={<Briefcase className="w-5 h-5" />} label="Total Openings" value={totalOpenings} color="bg-blue-50 text-blue-600" />
                    <StatCard
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        label="Moved to Applications"
                        value={appliedCount}
                        color="bg-indigo-50 text-indigo-600"
                        href="/dashboard/student/applications"
                    />
                    <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Available Now" value={remainingCount} color="bg-emerald-50 text-emerald-600" />
                </div>
            </div>

            {featuredJobs.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <h2 className="text-xl font-bold text-slate-800">Featured Jobs</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {featuredJobs.map((job) => (
                            <JobCard key={job.id} job={job} appliedJobIds={appliedJobIds} applyToJob={applyToJob} />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">{featuredJobs.length > 0 ? "More Opportunities" : "All Opportunities"}</h2>
                {regularJobs.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {regularJobs.map((job) => (
                            <JobCard key={job.id} job={job} appliedJobIds={appliedJobIds} applyToJob={applyToJob} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No jobs found</h3>
                        <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </section>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
            </div>
        </div>
    );
}

function JobCard({ job, appliedJobIds, applyToJob }: { job: JobCardModel; appliedJobIds: string[]; applyToJob: (job: JobCardModel) => void }) {
    const hasApplied = appliedJobIds.includes(job.id);

    return (
        <Link href={`/dashboard/student/openings/${job.id}`}>
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#6C5DD3]/20 group cursor-pointer relative overflow-hidden h-full flex flex-col">
                {hasApplied && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-bl-xl z-20">Applied</div>
                )}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1">
                        <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-[#6C5DD3] transition-colors truncate">{job.title}</h3>
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <Building2 className="w-4 h-4" />
                                <span className="text-sm font-medium">{job.company}</span>
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
                    <Button size="sm" disabled={hasApplied} onClick={(e) => { e.preventDefault(); e.stopPropagation(); applyToJob(job); }}>
                        {hasApplied ? "Applied" : "Apply Now"}
                    </Button>
                </div>
            </div>
        </Link>
    );
}

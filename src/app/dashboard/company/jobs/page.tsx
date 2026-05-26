"use client";
import { Button } from "@/components/ui/button";
import { Plus, Users, MoreHorizontal, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";

type JobView = {
    id: string;
    title: string;
    type: string;
    location: string;
    posted: string;
    deadline: string;
    applicants: number;
    status: string;
};

export default function CompanyJobsPage() {
    const [jobs, setJobs] = useState<JobView[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const token = await AuthService.getIdToken();
                if (!token) {
                    setJobs([]);
                    return;
                }

                const [opportunities, applications] = await Promise.all([
                    DashboardService.getCompanyOpportunities(token),
                    DashboardService.getCompanyApplications(token),
                ]);

                const appCountByOpportunity = applications.reduce((acc, item) => {
                    acc.set(item.opportunityId, (acc.get(item.opportunityId) || 0) + 1);
                    return acc;
                }, new Map<string, number>());

                setJobs(
                    opportunities.map((opportunity) => ({
                        deadline: opportunity.deadlineAt,
                        id: opportunity.id,
                        title: opportunity.title,
                        type: opportunity.opportunityType,
                        location: `${opportunity.location} (${opportunity.workMode})`,
                        posted: new Date(opportunity.createdAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
                        applicants: appCountByOpportunity.get(opportunity.id) || 0,
                        status: new Date(opportunity.deadlineAt) < new Date() ? "Invalid" : (opportunity.isActive ? "Active" : "Closed"),
                    }))
                );
            } catch {
                setJobs([]);
            }
        };

        load();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Job Posts</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage your open positions and track applicants</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/company/jobs/new">
                        <Plus className="w-5 h-5 mr-2" /> Post New Job
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}

                {/* Create New Placeholder */}
                <Link href="/dashboard/company/jobs/new" className="rounded-[24px] border-2 border-dashed border-slate-200 hover:border-[#6C5DD3] hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center h-full min-h-[200px] gap-4 group cursor-pointer bg-slate-50/50">
                    <div className="w-16 h-16 rounded-full bg-white group-hover:bg-[#6C5DD3] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-slate-500 group-hover:text-[#6C5DD3]">Create New Job Post</span>
                </Link>
            </div>
        </div>
    );
}

function JobCard({ job }: { job: JobView }) {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-[#6C5DD3]">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${job.status === "Active" ? "bg-green-50 text-green-600" : job.status === "Invalid" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>{job.status}</span>
                    <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#6C5DD3] transition-colors">{job.title}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{job.type} • {job.location}</p>

            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" /> {job.applicants} Applicants
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" /> {job.posted}
                </span>
                <span className={`text-xs font-bold ${job.status === "Invalid" ? "text-red-500" : "text-slate-400"}`}>
                    Deadline: {new Date(job.deadline).toLocaleDateString("en-LK")}
                </span>
                <Button asChild variant="link" size="sm">
                    <Link href={`/dashboard/company/applications?jobId=${job.id}`}>View Applicants</Link>
                </Button>
            </div>
        </div>
    )
}

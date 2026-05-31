"use client";

import { Button } from "@/components/ui/button";

import { Plus, Users, MoreHorizontal, Briefcase, Calendar, Bell } from "lucide-react";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthService } from "@/lib/services/auth.service";

import { DashboardService } from "@/lib/services/dashboard.service";

import ScheduleInterviewDialog from "@/components/features/company/ScheduleInterviewDialog";

import {

    DropdownMenu,

    DropdownMenuContent,

    DropdownMenuItem,

    DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { NotificationItem } from "@/lib/types/dashboard";



type JobView = {

    id: string;

    title: string;

    type: string;

    location: string;

    posted: string;

    deadline: string;

    applicants: number;

    shortlisted: number;

    status: string;

    hasDeadlineAlert: boolean;

};



const DEADLINE_NOTIFICATION_TITLE = "Application deadline passed";



export default function CompanyJobsPage() {

    const [jobs, setJobs] = useState<JobView[]>([]);

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const [scheduleTarget, setScheduleTarget] = useState<{ id: string; title: string } | null>(null);



    const loadData = useCallback(async () => {

        try {

            const token = await AuthService.getIdToken();

            if (!token) {

                setJobs([]);

                setNotifications([]);

                return;

            }



            const [opportunities, applications, notifs] = await Promise.all([

                DashboardService.getCompanyOpportunities(token),

                DashboardService.getCompanyApplications(token),

                DashboardService.getMyNotifications(token),

            ]);



            const appCountByOpportunity = applications.reduce((acc, item) => {

                acc.set(item.opportunityId, (acc.get(item.opportunityId) || 0) + 1);

                return acc;

            }, new Map<string, number>());



            const shortlistedByOpportunity = applications.reduce((acc, item) => {

                if (!item.status.toLowerCase().includes("short")) {

                    return acc;

                }

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

                    posted: new Date(opportunity.createdAt).toLocaleDateString("en-LK", {

                        month: "short",

                        day: "numeric",

                    }),

                    applicants: appCountByOpportunity.get(opportunity.id) || 0,

                    shortlisted: shortlistedByOpportunity.get(opportunity.id) || 0,

                    status: !opportunity.isActive

                        ? "Closed"

                        : new Date(opportunity.deadlineAt) < new Date(new Date().toDateString())

                          ? "Expired"

                          : "Active",

                    hasDeadlineAlert: deadlineNotifications.some(n => n.relatedOpportunityId === opportunity.id),

                }))

            );

            setNotifications(notifs);

        } catch {

            setJobs([]);

            setNotifications([]);

        }

    }, []);



    useEffect(() => {

        loadData();

    }, [loadData]);



    const deadlineNotifications = useMemo(

        () =>

            notifications.filter(

                (n) =>

                    n.title === DEADLINE_NOTIFICATION_TITLE &&

                    n.relatedOpportunityId &&

                    !n.isRead

            ),

        [notifications]

    );



    const jobTitleById = useMemo(() => new Map(jobs.map((j) => [j.id, j.title])), [jobs]);



    const handleScheduled = async (opportunityId: string) => {

        const matching = deadlineNotifications.filter((n) => n.relatedOpportunityId === opportunityId);

        try {

            const token = await AuthService.getIdToken();

            if (token) {

                await Promise.all(

                    matching.map((n) => DashboardService.markNotificationRead(token, n.id))

                );

            }

        } catch {

            /* non-blocking */

        }

        await loadData();

    };



    return (

        <div className="space-y-8">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-extrabold text-slate-800">Job Posts</h1>

                    <p className="text-slate-500 text-sm font-medium mt-1">

                        Manage your open positions and track applicants

                    </p>

                </div>

                <Button asChild>

                    <Link href="/dashboard/company/jobs/new">

                        <Plus className="w-5 h-5 mr-2" /> Post New Job

                    </Link>

                </Button>

            </div>



            {deadlineNotifications.length > 0 && (

                <div className="space-y-3">

                    {deadlineNotifications.map((notification) => {

                        const opportunityId = notification.relatedOpportunityId!;

                        const title = jobTitleById.get(opportunityId) || "this job";



                        return (

                            <div

                                key={notification.id}

                                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"

                            >

                                <div className="flex gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">

                                        <Bell className="w-5 h-5" />

                                    </div>

                                    <div>

                                        <p className="font-bold text-slate-800 text-sm">{notification.title}</p>

                                        <p className="text-sm text-slate-600 mt-0.5">{notification.body}</p>

                                    </div>

                                </div>

                                <Button
                                    size="sm"
                                    variant="default"
                                    className="shrink-0 rounded-[16px] h-10 px-5 text-sm font-bold"
                                    onClick={() => setScheduleTarget({ id: opportunityId, title })}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Set up interview date
                                </Button>

                            </div>

                        );

                    })}

                </div>

            )}



            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {jobs.map((job) => (

                    <JobCard

                        key={job.id}

                        job={job}

                        onScheduleInterview={() => setScheduleTarget({ id: job.id, title: job.title })}

                    />

                ))}



                <Link

                    href="/dashboard/company/jobs/new"

                    className="rounded-[24px] border-2 border-dashed border-slate-200 hover:border-[#6C5DD3] hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center h-full min-h-[200px] gap-4 group cursor-pointer bg-slate-50/50"

                >

                    <div className="w-16 h-16 rounded-full bg-white group-hover:bg-[#6C5DD3] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">

                        <Plus className="w-8 h-8" />

                    </div>

                    <span className="font-bold text-slate-500 group-hover:text-[#6C5DD3]">Create New Job Post</span>

                </Link>

            </div>



            {scheduleTarget && (

                <ScheduleInterviewDialog

                    open={!!scheduleTarget}

                    onOpenChange={(open) => {

                        if (!open) setScheduleTarget(null);

                    }}

                    opportunityId={scheduleTarget.id}

                    jobTitle={scheduleTarget.title}

                    onScheduled={() => handleScheduled(scheduleTarget.id)}

                />

            )}

        </div>

    );

}



function JobCard({ job, onScheduleInterview }: { job: JobView; onScheduleInterview: () => void }) {

    return (

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-all group flex flex-col">

            <div className="flex justify-between items-start mb-4">

                <div className="p-3 bg-indigo-50 rounded-xl text-[#6C5DD3]">

                    <Briefcase className="w-6 h-6" />

                </div>

                <div className="flex gap-2 items-center">
                    <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            job.status === "Active"
                                ? "bg-green-50 text-green-600"
                                : job.status === "Expired"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-100 text-slate-500"
                        }`}
                    >
                        {job.status}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="text-slate-400 hover:text-[#6C5DD3] p-1 hover:bg-indigo-50 rounded-lg transition-colors"
                                aria-label="Job actions"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-indigo-100 p-1.5 min-w-[220px]">
                            <DropdownMenuItem
                                className="rounded-[14px] cursor-pointer gap-2 py-2.5 px-3 text-sm font-bold text-[#6C5DD3] focus:bg-indigo-50 focus:text-[#5b4eb8] [&_svg]:text-[#6C5DD3]"
                                onClick={onScheduleInterview}
                            >
                                <Calendar className="w-4 h-4" />
                                Set up interview date
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </div>



            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#6C5DD3] transition-colors">

                {job.title}

            </h3>

            <p className="text-sm text-slate-500 font-medium mb-4">

                {job.type} • {job.location}

            </p>

            {job.hasDeadlineAlert && job.shortlisted > 0 && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <Bell className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 font-medium">
                        Deadline passed • {job.shortlisted} shortlisted • Schedule interviews
                    </p>
                </div>
            )}



            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">

                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">

                    <Users className="w-4 h-4 text-slate-400" /> {job.applicants} Applicants

                </div>

                {job.shortlisted > 0 && (

                    <div className="text-xs font-bold text-indigo-600">{job.shortlisted} Shortlisted</div>

                )}

            </div>



            <div className="mt-auto flex items-center justify-between flex-wrap gap-2">

                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">

                    <Calendar className="w-3 h-3" /> {job.posted}

                </span>

                <span

                    className={`text-xs font-bold ${job.status === "Expired" ? "text-red-500" : "text-slate-400"}`}

                >

                    Deadline: {new Date(job.deadline).toLocaleDateString("en-LK")}

                </span>

                <Button asChild variant="link" size="sm">

                    <Link href={`/dashboard/company/applications?jobId=${job.id}`}>View Applicants</Link>

                </Button>

            </div>

        </div>

    );

}


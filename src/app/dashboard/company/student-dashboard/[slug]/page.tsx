"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Briefcase,
	Calendar,
	ExternalLink,
	FileText,
	Github,
	GraduationCap,
	LayoutGrid,
	List as ListIcon,
	Mail,
	MessageSquare,
	Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SendOfferButton from "@/components/features/company/SendOfferButton";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem, ConversationItem } from "@/lib/types/dashboard";
import { ProjectService } from "@/lib/services/project.service";
import type { ProjectItem } from "@/lib/types/project";
import { resolveFieldOfMajorLabel } from "@/lib/constants/field-of-major";
import { normalizeDegreeName } from "@/lib/constants/university-degrees";
import { formatConversationListDate } from "@/lib/utils/datetime";

type DirectoryCandidate = {
	studentProfileId: string;
	fullName: string;
	university: string;
	degree: string;
	fieldOfMajor: string;
	gradYear: number;
	currentYear: number;
	gpa: number;
	email: string;
	skills: string;
	photoDataUrl?: string;
	availability: string;
};

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "ST";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function projectTechTags(techStack: string, limit = 6) {
	return techStack
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, limit);
}

function ProjectPortfolioItem({
	project,
	view,
}: {
	project: ProjectItem;
	view: "grid" | "list";
}) {
	const techs = projectTechTags(project.techStack);
	const image = project.images?.[0]?.imageUrl;

	const links = (
		<div className="flex flex-wrap gap-2 pt-1">
			{project.repositoryUrl && (
				<a
					href={project.repositoryUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600"
				>
					<Github className="h-3 w-3" />
					Code
				</a>
			)}
			{project.demoUrl && (
				<a
					href={project.demoUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
				>
					<ExternalLink className="h-3 w-3" />
					Demo
				</a>
			)}
		</div>
	);

	const techRow =
		techs.length > 0 ? (
			<div className="flex flex-wrap gap-1">
				{techs.map((tech) => (
					<span
						key={tech}
						className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
					>
						{tech}
					</span>
				))}
			</div>
		) : null;

	if (view === "list") {
		return (
			<article className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-shadow hover:shadow-md">
				{image ? (
					<img
						src={image}
						alt={project.title}
						className="h-20 w-28 shrink-0 rounded-lg object-cover"
					/>
				) : (
					<div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/90 to-violet-600/90">
						<span className="text-[10px] font-medium text-white/80">No preview</span>
					</div>
				)}
				<div className="min-w-0 flex-1 space-y-1.5">
					<h3 className="text-sm font-bold text-slate-800">{project.title}</h3>
					<p className="line-clamp-2 text-xs text-slate-600">{project.description}</p>
					{techRow}
					{links}
				</div>
			</article>
		);
	}

	return (
		<article className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 transition-shadow hover:shadow-md">
			{image ? (
				<img src={image} alt={project.title} className="h-28 w-full object-cover" />
			) : (
				<div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-indigo-500/90 to-violet-600/90">
					<span className="text-xs font-medium text-white/80">No preview</span>
				</div>
			)}
			<div className="space-y-2 p-3">
				<h3 className="text-sm font-bold text-slate-800">{project.title}</h3>
				<p className="line-clamp-2 text-xs text-slate-600">{project.description}</p>
				{techRow}
				{links}
			</div>
		</article>
	);
}

function StatPill({
	label,
	value,
	icon,
}: {
	label: string;
	value: string | number;
	icon: ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
				{icon}
			</div>
			<div className="min-w-0">
				<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
				<p className="truncate text-lg font-bold leading-tight text-slate-900">{value}</p>
			</div>
		</div>
	);
}

export default function CompanyStudentDashboardPreviewPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const slug = String(params?.slug || "");
	const candidateId = searchParams.get("id") || "";
	const candidateEmail = searchParams.get("email") || "";

	const [loading, setLoading] = useState(true);
	const [candidate, setCandidate] = useState<DirectoryCandidate | null>(null);
	const [companyApplications, setCompanyApplications] = useState<ApplicationItem[]>([]);
	const [conversations, setConversations] = useState<ConversationItem[]>([]);
	const [projects, setProjects] = useState<ProjectItem[]>([]);
	const [projectsError, setProjectsError] = useState<string | null>(null);
	const [projectsView, setProjectsView] = useState<"grid" | "list">("grid");

	useEffect(() => {
		const load = async () => {
			try {
				const token = await AuthService.getIdToken();
				if (!token) {
					setCandidate(null);
					setCompanyApplications([]);
					setConversations([]);
					setProjects([]);
					return;
				}

				const [directory, apps, convs] = await Promise.all([
					StudentService.getStudentDirectory(token),
					DashboardService.getCompanyApplications(token),
					DashboardService.getMyConversations(token),
				]);

				const slugName = slug.replace(/-/g, " ").toLowerCase();
				const found = directory.find(
					(item) =>
						(candidateId && item.studentProfileId === candidateId) ||
						(candidateEmail &&
							item.email.toLowerCase() === candidateEmail.toLowerCase()) ||
						item.fullName.toLowerCase() === slugName
				);

				const profileId = (candidateId || found?.studentProfileId || "").trim();

				setCandidate(
					found
						? {
								...found,
								studentProfileId: profileId || found.studentProfileId,
							}
						: null
				);
				setCompanyApplications(apps);
				setConversations(convs);

				if (profileId) {
					try {
						const studentProjects = await ProjectService.getStudentProjects(token, profileId);
						setProjects(studentProjects);
						setProjectsError(null);
					} catch (err: unknown) {
						setProjects([]);
						setProjectsError(
							err instanceof Error ? err.message : "Could not load portfolio projects."
						);
					}
				} else {
					setProjects([]);
					setProjectsError(null);
				}
			} catch {
				setCandidate(null);
				setCompanyApplications([]);
				setConversations([]);
				setProjects([]);
				setProjectsError(null);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [candidateEmail, candidateId, slug]);

	const skills = useMemo(() => {
		return (candidate?.skills || "")
			.split(",")
			.map((skill) => skill.trim())
			.filter(Boolean);
	}, [candidate?.skills]);

	const applicationsForCandidate = useMemo(() => {
		if (!candidate?.email) return [];
		return companyApplications
			.filter((item) => item.studentEmail.toLowerCase() === candidate.email.toLowerCase())
			.sort(
				(a, b) =>
					new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
			);
	}, [candidate?.email, companyApplications]);

	const recentApplicationsPreview = useMemo(
		() => applicationsForCandidate.slice(0, 6),
		[applicationsForCandidate]
	);

	const allApplicationsHref = useMemo(() => {
		if (!candidate?.studentProfileId) return "/dashboard/company/applications";
		const params = new URLSearchParams({
			studentProfileId: candidate.studentProfileId,
			view: "list",
		});
		if (candidate.fullName) {
			params.set("studentName", candidate.fullName);
		}
		return `/dashboard/company/applications?${params.toString()}`;
	}, [candidate?.studentProfileId, candidate?.fullName]);

	const existingConversation = useMemo(() => {
		if (!candidate?.fullName) return null;
		const normalized = candidate.fullName.trim().toLowerCase();
		return (
			conversations.find((row) => row.otherPartyName.trim().toLowerCase() === normalized) || null
		);
	}, [candidate?.fullName, conversations]);

	const hasConversation = Boolean(existingConversation);

	const openChatHref = useMemo(() => {
		if (!candidate?.studentProfileId) return "/dashboard/company/messages";
		if (existingConversation?.id) {
			return `/dashboard/company/messages?conversationId=${encodeURIComponent(existingConversation.id)}`;
		}
		return `/dashboard/company/messages?studentProfileId=${encodeURIComponent(candidate.studentProfileId)}`;
	}, [candidate?.studentProfileId, existingConversation?.id]);

	if (loading) {
		return (
			<div className="rounded-2xl border border-slate-100 bg-white p-8 text-sm text-slate-500">
				Loading candidate profile…
			</div>
		);
	}

	if (!candidate) {
		return (
			<div className="rounded-2xl border border-slate-100 bg-white p-8">
				<h2 className="text-xl font-bold text-slate-800">Student not found</h2>
				<p className="mt-2 text-sm text-slate-500">
					We could not map this candidate from the student directory.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<Card className="rounded-2xl border-slate-100 shadow-sm">
				<CardContent className="p-5 md:p-6">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<div className="flex min-w-0 flex-1 items-start gap-4">
							<Avatar className="h-16 w-16 shrink-0 border-2 border-white shadow-md">
								{candidate.photoDataUrl && (
									<AvatarImage src={candidate.photoDataUrl} alt={candidate.fullName} />
								)}
								<AvatarFallback className="bg-indigo-50 text-lg font-extrabold text-indigo-600">
									{getInitials(candidate.fullName)}
								</AvatarFallback>
							</Avatar>

							<div className="min-w-0 flex-1 space-y-2">
								<h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
									{candidate.fullName}
								</h1>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 md:text-sm">
									<span className="inline-flex items-center gap-1">
										<GraduationCap className="h-3.5 w-3.5" />
										{candidate.university}
									</span>
									<span className="inline-flex items-center gap-1">
										<Calendar className="h-3.5 w-3.5" />
										Class of {candidate.gradYear}
									</span>
									<span className="inline-flex items-center gap-1">
										<Mail className="h-3.5 w-3.5" />
										{candidate.email}
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-1.5">
									{resolveFieldOfMajorLabel(candidate.fieldOfMajor, candidate.degree) && (
										<Badge className="border-none bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
											{resolveFieldOfMajorLabel(candidate.fieldOfMajor, candidate.degree)}
										</Badge>
									)}
									<Badge className="border-none bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
										{normalizeDegreeName(candidate.degree)}
									</Badge>
									<Badge className="border-none bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
										GPA {candidate.gpa.toFixed(2)}
									</Badge>
									<Badge
										className={
											candidate.availability === "Available Now"
												? "border-none bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
												: candidate.availability === "Actively Looking"
													? "border-none bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
													: candidate.availability === "Open to Offers"
														? "border-none bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
														: "border-none bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
										}
									>
										{candidate.availability}
									</Badge>
								</div>
								{skills.length > 0 && (
									<div className="flex flex-wrap gap-1.5 pt-1">
										{skills.map((skill) => (
											<span
												key={skill}
												className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
											>
												{skill}
											</span>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="flex shrink-0 gap-2 lg:self-start">
							<Button asChild variant="outline" size="sm" className="whitespace-nowrap">
								<Link href={openChatHref}>
									<MessageSquare className="mr-2 h-4 w-4" />
									{hasConversation ? "Open Chat" : "Start Chat"}
								</Link>
							</Button>
							<SendOfferButton
								candidateName={candidate.fullName}
								studentProfileId={candidate.studentProfileId}
								existingConversationId={existingConversation?.id}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{applicationsForCandidate.length > 0 ? (
					<Link
						href={allApplicationsHref}
						className="block transition-opacity hover:opacity-90"
					>
						<StatPill
							label="Applications"
							value={applicationsForCandidate.length}
							icon={<Briefcase className="h-4 w-4" />}
						/>
					</Link>
				) : (
					<StatPill
						label="Applications"
						value={0}
						icon={<Briefcase className="h-4 w-4" />}
					/>
				)}
				<StatPill
					label="Skills"
					value={skills.length}
					icon={<Sparkles className="h-4 w-4" />}
				/>
			</div>

			<div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
				<Card className="rounded-2xl border-slate-100 xl:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 pt-4 px-4">
						<CardTitle className="text-sm font-bold text-slate-800">
							Recent Applications
							{applicationsForCandidate.length > 0 && (
								<span className="ml-1.5 font-normal text-slate-400">
									({applicationsForCandidate.length})
								</span>
							)}
						</CardTitle>
						{applicationsForCandidate.length > 0 && (
							<Button asChild variant="outline" size="sm" className="h-8 shrink-0 rounded-lg text-xs">
								<Link href={allApplicationsHref}>
									See all
								</Link>
							</Button>
						)}
					</CardHeader>
					<CardContent className="space-y-2 px-4 pb-4">
						{recentApplicationsPreview.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-slate-800">{item.jobTitle}</p>
									<p className="inline-flex items-center gap-1 text-[11px] text-slate-500">
										<FileText className="h-3 w-3" />
										{formatConversationListDate(item.appliedAt)}
									</p>
								</div>
								<Badge
									variant="outline"
									className="shrink-0 border-slate-200 bg-white text-[10px] font-semibold text-slate-700"
								>
									{item.status}
								</Badge>
							</div>
						))}
						{applicationsForCandidate.length === 0 && (
							<p className="py-4 text-center text-sm text-slate-500">
								No applications to your company yet.
							</p>
						)}
					</CardContent>
				</Card>

				<Card className="flex min-h-0 flex-col rounded-2xl border-slate-100 xl:col-span-3">
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 pt-4 px-4">
						<CardTitle className="text-sm font-bold text-slate-800">
							Portfolio Projects
							{projects.length > 0 && (
								<span className="ml-2 font-normal text-slate-400">({projects.length})</span>
							)}
						</CardTitle>
						{projects.length > 0 && (
							<div className="flex shrink-0 gap-1 rounded-lg bg-slate-100 p-0.5">
								<button
									type="button"
									onClick={() => setProjectsView("grid")}
									aria-label="Grid view"
									className={cn(
										"rounded-md p-1.5 transition-colors",
										projectsView === "grid"
											? "bg-white text-[#6C5DD3] shadow-sm"
											: "text-slate-500 hover:text-slate-700"
									)}
								>
									<LayoutGrid className="h-4 w-4" />
								</button>
								<button
									type="button"
									onClick={() => setProjectsView("list")}
									aria-label="List view"
									className={cn(
										"rounded-md p-1.5 transition-colors",
										projectsView === "list"
											? "bg-white text-[#6C5DD3] shadow-sm"
											: "text-slate-500 hover:text-slate-700"
									)}
								>
									<ListIcon className="h-4 w-4" />
								</button>
							</div>
						)}
					</CardHeader>
					<CardContent className="min-h-0 flex-1 px-4 pb-4">
						{projects.length > 0 ? (
							<div
								className={cn(
									"max-h-[min(28rem,55vh)] overflow-y-auto overscroll-contain pr-1",
									projectsView === "grid"
										? "grid grid-cols-1 gap-3 md:grid-cols-2"
										: "flex flex-col gap-3"
								)}
							>
								{projects.map((project) => (
									<ProjectPortfolioItem
										key={project.id}
										project={project}
										view={projectsView}
									/>
								))}
							</div>
						) : (
							<div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
								<p className="text-sm font-medium text-slate-600">
									{projectsError ? "Could not load projects" : "No portfolio projects yet"}
								</p>
								<p className="mt-1 text-xs text-slate-400">
									{projectsError
										? `${projectsError} Restart the API if you recently updated the backend.`
										: "This student has not published projects on their profile."}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

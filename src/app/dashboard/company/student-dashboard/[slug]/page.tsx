"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar, Mail, MessageSquare, FileText, Sparkles } from "lucide-react";
import SendOfferButton from "@/components/features/company/SendOfferButton";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem, ConversationItem } from "@/lib/types/dashboard";

type DirectoryCandidate = {
	studentProfileId: string;
	fullName: string;
	university: string;
	degree: string;
	gradYear: number;
	gpa: number;
	email: string;
	skills: string;
};

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "ST";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function CompanyStudentDashboardPreviewPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const slug = String(params?.slug || "");
	const candidateId = searchParams.get("id") || "";

	const [loading, setLoading] = useState(true);
	const [candidate, setCandidate] = useState<DirectoryCandidate | null>(null);
	const [companyApplications, setCompanyApplications] = useState<ApplicationItem[]>([]);
	const [conversations, setConversations] = useState<ConversationItem[]>([]);

	useEffect(() => {
		const load = async () => {
			try {
				const token = await AuthService.getIdToken();
				if (!token) {
					setCandidate(null);
					setCompanyApplications([]);
					setConversations([]);
					return;
				}

				const [directory, apps, convs] = await Promise.all([
					StudentService.getStudentDirectory(token),
					DashboardService.getCompanyApplications(token),
					DashboardService.getMyConversations(token),
				]);

				const slugName = slug.replace(/-/g, " ").toLowerCase();
				const found = directory.find((item) =>
					(candidateId && item.studentProfileId === candidateId) ||
					item.fullName.toLowerCase() === slugName
				);

				setCandidate(found || null);
				setCompanyApplications(apps);
				setConversations(convs);
			} catch {
				setCandidate(null);
				setCompanyApplications([]);
				setConversations([]);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [candidateId, slug]);

	const skills = useMemo(() => {
		return (candidate?.skills || "")
			.split(",")
			.map((skill) => skill.trim())
			.filter(Boolean);
	}, [candidate?.skills]);

	const applicationsForCandidate = useMemo(() => {
		if (!candidate?.email) return [];
		return companyApplications.filter((item) => item.studentEmail.toLowerCase() === candidate.email.toLowerCase());
	}, [candidate?.email, companyApplications]);

	const existingConversation = useMemo(() => {
		if (!candidate?.fullName) return null;
		const normalized = candidate.fullName.trim().toLowerCase();
		return conversations.find((row) => row.otherPartyName.trim().toLowerCase() === normalized) || null;
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
		return <div className="bg-white rounded-2xl p-6 text-sm text-slate-500">Loading student dashboard preview...</div>;
	}

	if (!candidate) {
		return (
			<div className="bg-white rounded-2xl p-6 border border-slate-100">
				<h2 className="text-xl font-bold text-slate-800">Student not found</h2>
				<p className="text-sm text-slate-500 mt-2">We could not map this candidate from the student directory.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card className="rounded-3xl border-slate-100 shadow-sm">
				<CardContent className="p-6 md:p-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
						<div className="flex items-start gap-4 md:gap-5">
							<Avatar className="h-20 w-20 border-4 border-white shadow-md">
								<AvatarFallback className="bg-indigo-50 text-indigo-600 text-xl font-extrabold">
									{getInitials(candidate.fullName)}
								</AvatarFallback>
							</Avatar>

							<div className="space-y-2">
								<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{candidate.fullName}</h1>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
									<span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{candidate.university}</span>
									<span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" />Class of {candidate.gradYear}</span>
									<span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4" />{candidate.email}</span>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Badge className="bg-indigo-50 text-indigo-700 border-none">{candidate.degree}</Badge>
									<Badge className="bg-emerald-50 text-emerald-700 border-none">GPA {candidate.gpa.toFixed(2)}</Badge>
								</div>
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button asChild variant="outline">
								<Link href={openChatHref}>
									<MessageSquare className="w-4 h-4 mr-2" />
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

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="rounded-2xl border-slate-100">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-500 font-semibold">Applications To Your Jobs</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-black text-slate-900">{applicationsForCandidate.length}</p>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-slate-100">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-500 font-semibold">Skills Listed</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-black text-slate-900">{skills.length}</p>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-slate-100">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-500 font-semibold">Conversation</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-indigo-600" />
							{hasConversation ? "Existing chat found" : "No chat yet"}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				<Card className="rounded-2xl border-slate-100">
					<CardHeader>
						<CardTitle className="text-base text-slate-800">Skills</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{skills.map((skill) => (
								<Badge key={skill} variant="secondary" className="rounded-xl">
									{skill}
								</Badge>
							))}
							{skills.length === 0 && <p className="text-sm text-slate-500">No skills listed yet.</p>}
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-slate-100">
					<CardHeader>
						<CardTitle className="text-base text-slate-800">Recent Applications</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{applicationsForCandidate.slice(0, 5).map((item) => (
							<div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-semibold text-slate-800">{item.jobTitle}</p>
									<p className="text-xs text-slate-500 inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{new Date(item.appliedAt).toLocaleDateString("en-LK")}</p>
								</div>
								<Badge className="bg-white text-slate-700 border border-slate-200">{item.status}</Badge>
							</div>
						))}
						{applicationsForCandidate.length === 0 && (
							<p className="text-sm text-slate-500">No applications found for this student in your company yet.</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

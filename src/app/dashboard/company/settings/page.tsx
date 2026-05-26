"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users2, CreditCard, Bell, Shield } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthService } from "@/lib/services/auth.service";
import { CompanyService } from "@/lib/services/company.service";
import { CompanyTeamService } from "@/lib/services/company-team.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { CompanyProfile, TeamMember } from "@/lib/types/company";

const COMPANY_SIZE_OPTIONS = ["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "500+ employees"];

type UsageStats = {
    activeJobs: number;
    totalApplications: number;
    conversations: number;
};

const emptyProfile: CompanyProfile = {
    email: "",
    firebaseUid: "",
    companyName: "",
    companyEmail: "",
    phone: "",
    website: "",
    industry: "",
    logoDataUrl: "",
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    position: "",
};

export default function CompanySettingsPage() {
    const { user } = useAuth();
    const { show } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const [companySize, setCompanySize] = useState("51-200 employees");
    const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Recruiter" });
    const [usage, setUsage] = useState<UsageStats>({
        activeJobs: 0,
        totalApplications: 0,
        conversations: 0,
    });

    useEffect(() => {
        const load = async () => {
            try {
                const token = await AuthService.getIdToken();
                if (!token) {
                    setLoadingPage(false);
                    return;
                }

                const [company, opportunities, applications, conversations] = await Promise.all([
                    CompanyService.getCurrentCompany(token),
                    DashboardService.getCompanyOpportunities(token),
                    DashboardService.getCompanyApplications(token),
                    DashboardService.getMyConversations(token),
                ]);

                setProfile(company);
                setUsage({
                    activeJobs: opportunities.filter((job) => job.isActive).length,
                    totalApplications: applications.length,
                    conversations: conversations.length,
                });
            } catch {
                setProfile((prev) => ({
                    ...prev,
                    email: user?.email || prev.email,
                    firebaseUid: user?.uid || prev.firebaseUid,
                }));
            } finally {
                setLoadingPage(false);
            }
        };

        load();
    }, [user?.email, user?.uid]);

    const initials = useMemo(() => {
        const source = profile.companyName || "Company";
        return source
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("");
    }, [profile.companyName]);

    const loadTeamMembers = async () => {
        setTeamLoading(true);
        try {
            const token = await AuthService.getIdToken();
            if (!token) {
                setTeamMembers([]);
                return;
            }

            const rows = await CompanyTeamService.getMyTeam(token);
            setTeamMembers(rows);
        } catch (error: any) {
            show({
                title: "Failed to load team",
                description: error?.message || "Please try again.",
                variant: "error",
            });
        } finally {
            setTeamLoading(false);
        }
    };

    useEffect(() => {
        loadTeamMembers();
    }, []);

    const handleInvite = async () => {
        if (!inviteForm.name.trim() || !inviteForm.email.trim() || !inviteForm.role.trim()) {
            show({ title: "Missing fields", description: "Name, email, and role are required.", variant: "warning" });
            return;
        }

        setInviting(true);
        try {
            const token = await AuthService.getIdToken();
            if (!token) throw new Error("You must be signed in to invite members.");

            const invited = await CompanyTeamService.inviteMember(token, {
                name: inviteForm.name.trim(),
                email: inviteForm.email.trim(),
                role: inviteForm.role.trim(),
            });

            setTeamMembers((prev) => [invited, ...prev.filter((m) => m.id !== invited.id)]);
            setInviteForm({ name: "", email: "", role: "Recruiter" });

            show({
                title: "Invitation created",
                description: `Invite sent to ${invited.email}.`,
                variant: "success",
            });
        } catch (error: any) {
            show({
                title: "Invite failed",
                description: error?.message || "Please try again.",
                variant: "error",
            });
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async (memberId: string) => {
        setRemovingId(memberId);
        try {
            const token = await AuthService.getIdToken();
            if (!token) throw new Error("You must be signed in to remove members.");

            await CompanyTeamService.removeMember(token, memberId);
            setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
            show({ title: "Member removed", variant: "success" });
        } catch (error: any) {
            show({
                title: "Remove failed",
                description: error?.message || "Please try again.",
                variant: "error",
            });
        } finally {
            setRemovingId(null);
        }
    };

    const handleSave = async () => {
        if (!user?.uid || !user?.email) {
            show({ title: "Not signed in", description: "Please sign in again and retry.", variant: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const token = await AuthService.getIdToken();
            if (!token) throw new Error("Missing auth token");

            const saved = await CompanyService.registerCompany(token, {
                email: user.email,
                firebaseUid: user.uid,
                companyName: profile.companyName,
                companyEmail: profile.companyEmail,
                phone: profile.phone,
                website: profile.website || null,
                industry: profile.industry,
                logoDataUrl: profile.logoDataUrl || null,
                recruiterName: profile.recruiterName,
                recruiterEmail: profile.recruiterEmail,
                recruiterPhone: profile.recruiterPhone,
                position: profile.position,
            });

            setProfile(saved);
            show({ title: "Saved", description: "Company settings updated.", variant: "success" });
        } catch (error: any) {
            show({ title: "Save failed", description: error?.message || "Unable to update settings.", variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Settings</h1>
                    <p className="text-sm text-slate-500">Manage your organization profile and team members.</p>
                </div>
            </div>

            {loadingPage ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-sm text-slate-500">Loading company settings...</div>
            ) : (

            <Tabs defaultValue="organization" className="w-full">
                <TabsList className="bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <TabsTrigger value="organization" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <Building2 className="w-4 h-4 mr-2" />
                        Organization
                    </TabsTrigger>
                    <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <Users2 className="w-4 h-4 mr-2" />
                        Team
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Billing
                    </TabsTrigger>
                </TabsList>

                {/* Organization Settings */}
                <TabsContent value="organization" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-4 border-white shadow-lg rounded-xl">
                                    <AvatarImage src={profile.logoDataUrl || "/company-logo-placeholder.png"} alt="Company Logo" />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold rounded-xl">{initials}</AvatarFallback>
                                </Avatar>
                                <Button size="sm" variant="outline" className="mt-2 w-full text-xs">Upload Logo</Button>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900">Company Branding</h3>
                                <p className="text-sm text-slate-500 mb-2">Upload your company logo (Square 1:1, max 2MB).</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" value={profile.companyName} onChange={(event) => setProfile((prev) => ({ ...prev, companyName: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" value={profile.website || ""} onChange={(event) => setProfile((prev) => ({ ...prev, website: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Input id="industry" value={profile.industry} onChange={(event) => setProfile((prev) => ({ ...prev, industry: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="size">Company Size</Label>
                                <select id="size" value={companySize} onChange={(event) => setCompanySize(event.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                                    {COMPANY_SIZE_OPTIONS.map((size) => (
                                        <option key={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="companyEmail">Company Email</Label>
                                <Input id="companyEmail" value={profile.companyEmail} onChange={(event) => setProfile((prev) => ({ ...prev, companyEmail: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="companyPhone">Company Phone</Label>
                                <Input id="companyPhone" value={profile.phone} onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recruiterName">Recruiter Name</Label>
                                <Input id="recruiterName" value={profile.recruiterName} onChange={(event) => setProfile((prev) => ({ ...prev, recruiterName: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recruiterPosition">Recruiter Position</Label>
                                <Input id="recruiterPosition" value={profile.position} onChange={(event) => setProfile((prev) => ({ ...prev, position: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recruiterEmail">Recruiter Email</Label>
                                <Input id="recruiterEmail" value={profile.recruiterEmail} onChange={(event) => setProfile((prev) => ({ ...prev, recruiterEmail: event.target.value }))} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recruiterPhone">Recruiter Phone</Label>
                                <Input id="recruiterPhone" value={profile.recruiterPhone} onChange={(event) => setProfile((prev) => ({ ...prev, recruiterPhone: event.target.value }))} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]" onClick={handleSave} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Team Settings */}
                <TabsContent value="team" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Team Members</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-slate-100 rounded-xl mb-4">
                            <Input
                                placeholder="Full name"
                                value={inviteForm.name}
                                onChange={(event) => setInviteForm((prev) => ({ ...prev, name: event.target.value }))}
                                className="rounded-xl"
                            />
                            <Input
                                placeholder="Email"
                                type="email"
                                value={inviteForm.email}
                                onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))}
                                className="rounded-xl"
                            />
                            <Input
                                placeholder="Role"
                                value={inviteForm.role}
                                onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}
                                className="rounded-xl"
                            />
                            <Button
                                size="sm"
                                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                                onClick={handleInvite}
                                disabled={inviting}
                            >
                                <Users2 className="w-4 h-4 mr-2" />
                                {inviting ? "Inviting..." : "Invite Member"}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {teamLoading && (
                                <div className="text-sm text-slate-500 p-3">Loading team members...</div>
                            )}

                            {!teamLoading && teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-10 h-10 bg-slate-200">
                                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            }`}>{member.status}</span>
                                        <span className="text-xs text-slate-500">{member.role}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-400 hover:text-red-500"
                                            onClick={() => handleRemove(member.id)}
                                            disabled={removingId === member.id}
                                        >
                                            {removingId === member.id ? "Removing..." : "Remove"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {!teamLoading && teamMembers.length === 0 && (
                                <p className="text-sm text-slate-500">No team members found in real data.</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Billing Settings */}
                <TabsContent value="billing" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Current Plan</h3>
                                <p className="text-sm text-slate-500">You are on the <span className="font-bold text-[#6C5DD3]">Pro Plan</span></p>
                            </div>
                            <span className="bg-[#6C5DD3]/10 text-[#6C5DD3] px-3 py-1 rounded-full text-xs font-bold">Active</span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Job Posts</p>
                                <p className="text-xl font-bold text-slate-900">{usage.activeJobs} / 10</p>
                                <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-[#6C5DD3] h-full" style={{ width: `${Math.min(100, Math.round((usage.activeJobs / 10) * 100))}%` }}></div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Applications Received</p>
                                <p className="text-xl font-bold text-slate-900">{usage.totalApplications} / 500</p>
                                <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-[#6C5DD3] h-full" style={{ width: `${Math.min(100, Math.round((usage.totalApplications / 500) * 100))}%` }}></div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Conversations</p>
                                <p className="text-xl font-bold text-slate-900">{usage.conversations}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                            <Button variant="outline" className="rounded-xl">View Invoices</Button>
                            <Button className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]">Upgrade Plan</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            )}
        </div>
    );
}

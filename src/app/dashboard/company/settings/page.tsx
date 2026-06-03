"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, CreditCard, Shield } from "lucide-react";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import { CompanyPageHeader } from "@/components/layout/company/CompanyPageHeader";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthService } from "@/lib/services/auth.service";
import { CompanyService } from "@/lib/services/company.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { CompanyProfile } from "@/lib/types/company";
import { auth } from "@/lib/firebase";

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
    const { user, resetPassword, changePassword } = useAuth();
    const { show } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const [companySize, setCompanySize] = useState("51-200 employees");
    const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
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

    const handleSendResetLink = async () => {
        const email = user?.email || auth.currentUser?.email;
        if (!email) {
            show({
                title: "Unable to reset password",
                description: "Your account email is not available.",
                variant: "error",
            });
            return;
        }

        try {
            setIsSendingReset(true);
            await resetPassword(email);
            show({
                title: "Reset email sent",
                description: `Password reset instructions were sent to ${email}.`,
                variant: "success",
            });
        } catch (error: any) {
            show({
                title: "Reset failed",
                description: error?.message || "Could not send reset email.",
                variant: "error",
            });
        } finally {
            setIsSendingReset(false);
        }
    };

    const handleConfirmPasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            show({ title: "Missing fields", description: "Please fill all password fields.", variant: "error" });
            return;
        }

        if (newPassword.length < 6) {
            show({ title: "Weak password", description: "New password must be at least 6 characters.", variant: "error" });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            show({
                title: "Passwords do not match",
                description: "New password and confirm password must match.",
                variant: "error",
            });
            return;
        }

        try {
            setIsChangingPassword(true);
            await changePassword(currentPassword, newPassword);

            let emailNoticeSent = false;
            const email = user?.email || auth.currentUser?.email;
            if (email) {
                try {
                    await resetPassword(email);
                    emailNoticeSent = true;
                } catch {
                    emailNoticeSent = false;
                }
            }

            show({
                title: "Password changed",
                description: emailNoticeSent
                    ? "Your password was updated and a security email was sent."
                    : "Your password was updated successfully.",
                variant: "success",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowChangePasswordModal(false);
        } catch (error: any) {
            show({
                title: "Change failed",
                description: error?.message || "Failed to change password.",
                variant: "error",
            });
        } finally {
            setIsChangingPassword(false);
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
        <CompanyPageContainer>
            <CompanyPageHeader
                eyebrow="Account"
                title="Company Settings"
                subtitle="Manage your organization profile, security, and billing."
                showSearch={false}
                showNotifications={false}
            />

            {loadingPage ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-sm text-slate-500 shadow-sm">
                    Loading company settings...
                </div>
            ) : (

            <Tabs defaultValue="organization" className="w-full">
                <TabsList className="rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm">
                    <TabsTrigger value="organization" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <Building2 className="w-4 h-4 mr-2" />
                        Organization
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <Shield className="w-4 h-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Billing
                    </TabsTrigger>
                </TabsList>

                {/* Organization Settings */}
                <TabsContent value="organization" className="mt-6 space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
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

                {/* Security Settings */}
                <TabsContent value="security" className="mt-6 space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#6C5DD3]">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">Account Security</h3>
                                <p className="text-sm text-slate-500">
                                    Change your sign-in password or request a reset link sent to your account email.
                                </p>
                            </div>
                        </div>

                        <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed in as</p>
                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {user?.email || profile.email || "—"}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                type="button"
                                onClick={() => setShowChangePasswordModal(true)}
                            >
                                Change Password
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-xl"
                                type="button"
                                onClick={handleSendResetLink}
                                disabled={isSendingReset}
                            >
                                {isSendingReset ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Use a strong password you do not reuse on other sites. Reset links expire after a short time.
                        </p>
                    </div>
                </TabsContent>

                {/* Billing Settings */}
                <TabsContent value="billing" className="mt-6 space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">Current Plan</h3>
                                    <p className="text-sm text-slate-500">
                                        You are on the <span className="font-bold text-[#6C5DD3]">Pro Plan</span>
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#6C5DD3]/10 px-3 py-1 text-xs font-bold text-[#6C5DD3]">
                                Active
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                <p className="text-xs text-slate-500 mb-1">Job Posts</p>
                                <p className="text-xl font-bold text-slate-900">{usage.activeJobs} / 10</p>
                                <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-[#6C5DD3] h-full" style={{ width: `${Math.min(100, Math.round((usage.activeJobs / 10) * 100))}%` }}></div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                <p className="text-xs text-slate-500 mb-1">Applications Received</p>
                                <p className="text-xl font-bold text-slate-900">{usage.totalApplications} / 500</p>
                                <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-[#6C5DD3] h-full" style={{ width: `${Math.min(100, Math.round((usage.totalApplications / 500) * 100))}%` }}></div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
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

            {showChangePasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowChangePasswordModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-1 text-xl font-bold text-slate-900">Change Password</h3>
                        <p className="mb-5 text-sm text-slate-500">
                            Enter your current password and choose a new one.
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                variant="softSurface"
                                type="button"
                                onClick={() => setShowChangePasswordModal(false)}
                                disabled={isChangingPassword}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-[#6C5DD3] hover:bg-[#5b4eb8]"
                                onClick={handleConfirmPasswordChange}
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </CompanyPageContainer>
    );
}

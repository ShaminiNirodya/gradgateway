"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Shield, User, Search, Camera } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudentProfile } from "@/lib/hooks/useStudentProfile";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { auth } from "@/lib/firebase";
import { StorageService } from "@/lib/services/storage.service";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
    ALL_UNIVERSITIES,
    ALL_DEGREES,
    getDegreesForUniversity,
    universityOffersDegree,
    normalizeDegreeName,
} from "@/lib/constants/university-degrees";
import {
    type FieldOfMajorId,
    getDegreesForFieldOfMajor,
    getFieldOfMajorById,
    getFieldOfMajorByLabel,
    inferFieldOfMajorFromDegree,
    degreeBelongsToField,
} from "@/lib/constants/field-of-major";
import { FieldOfMajorSelect } from "@/components/shared/FieldOfMajorSelect";

// Dynamic filtering will be applied via useMemo hooks below

const GRADUATION_YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i);

export default function StudentSettingsPage() {
    const { userData, resetPassword, changePassword } = useAuth();
    const { show } = useToast();
    const { profile, initials, loading, refresh } = useStudentProfile();
    const [isSaving, setIsSaving] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [degree, setDegree] = useState("");
    const [fieldOfMajorId, setFieldOfMajorId] = useState<FieldOfMajorId | "">("");
    const [university, setUniversity] = useState("");
    const [gradYear, setGradYear] = useState("");
    const [currentYear, setCurrentYear] = useState<number>(1);
    const [gpa, setGpa] = useState("");
    const [certificationsText, setCertificationsText] = useState("");
    const [awardsText, setAwardsText] = useState("");
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [degreeSearch, setDegreeSearch] = useState("");
    const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
    const [universitySearch, setUniversitySearch] = useState("");
    const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
    const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dynamic filtering based on selections
    const availableDegrees = useMemo(() => {
        let degrees = university ? getDegreesForUniversity(university) : ALL_DEGREES;
        if (fieldOfMajorId) {
            const fieldSet = new Set(getDegreesForFieldOfMajor(fieldOfMajorId));
            degrees = degrees.filter((d) => fieldSet.has(d));
        }
        return degrees;
    }, [university, fieldOfMajorId]);

    const degreeNotOfferedAtUniversity = useMemo(() => {
        if (!university || !degree) {
            return false;
        }
        return !universityOffersDegree(university, degree);
    }, [university, degree]);

    useEffect(() => {
        if (!profile) return;

        const parts = (profile.fullName || "").trim().split(/\s+/).filter(Boolean);
        const localFirst = parts[0] || "";
        const localLast = parts.length > 1 ? parts.slice(1).join(" ") : "";

        setFirstName(localFirst);
        setLastName(localLast);
        setDegree(normalizeDegreeName(profile.degree || ""));
        const savedUniversity = profile.university || "";
        setUniversity(savedUniversity === "Other" ? "" : savedUniversity);
        const savedField = profile.fieldOfMajor
            ? getFieldOfMajorByLabel(profile.fieldOfMajor)?.id
            : "";
        setFieldOfMajorId(
            (savedField as FieldOfMajorId) ||
                inferFieldOfMajorFromDegree(profile.degree || "") ||
                ""
        );
        setGradYear(String(profile.gradYear || ""));
        setCurrentYear(profile.currentYear || 1);
        setGpa(String(profile.gpa ?? ""));
        setCertificationsText((profile.certifications || []).join("\n"));
        setAwardsText((profile.awards || []).join("\n"));
        setPhotoDataUrl(profile.photoDataUrl || "");
    }, [profile]);

    const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            show({ title: "Invalid file", description: "Please select an image file.", variant: "error" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            show({ title: "File too large", description: "Image must be under 5MB.", variant: "error" });
            return;
        }

        try {
            setIsUploadingPhoto(true);
            const firebaseUid = auth.currentUser?.uid || profile?.firebaseUid;
            if (!firebaseUid) throw new Error("User not authenticated");

            const downloadUrl = await StorageService.uploadProfilePicture(file, firebaseUid);
            
            setPhotoDataUrl(downloadUrl);
            show({ title: "Photo uploaded", description: "Click 'Save Profile' to keep the change.", variant: "success" });
        } catch (error: any) {
            show({ title: "Upload failed", description: error?.message || "Unable to upload image.", variant: "error" });
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSave = async () => {
        if (!profile) return;

        if (!fieldOfMajorId) {
            show({
                title: "Field of major required",
                description: "Please select your field of major before saving.",
                variant: "error",
            });
            return;
        }

        if (degreeNotOfferedAtUniversity) {
            show({
                title: "Degree does not match university",
                description: "Please select a degree offered by your chosen university before saving.",
                variant: "error",
            });
            return;
        }

        if (degree && !degreeBelongsToField(degree, fieldOfMajorId)) {
            show({
                title: "Degree does not match field",
                description: "Please select a degree that matches your field of major.",
                variant: "error",
            });
            return;
        }

        try {
            setIsSaving(true);
            const token = await AuthService.getIdToken();
            const firebaseUid = auth.currentUser?.uid || profile.firebaseUid;
            const email = auth.currentUser?.email || profile.email;

            if (!token || !firebaseUid || !email) {
                throw new Error("You are not authenticated. Please log in again.");
            }

            await StudentService.registerStudent(token, {
                email,
                firebaseUid,
                fullName,
                phone: profile.phone,
                photoDataUrl: photoDataUrl || profile.photoDataUrl,
                university,
                studentId: profile.studentId,
                degree: normalizeDegreeName(degree),
                fieldOfMajor: getFieldOfMajorById(fieldOfMajorId)?.label ?? "",
                gradYear,
                currentYear,
                gpa,
                certifications: certificationsText.split(/\r?\n/).map((v) => v.trim()).filter(Boolean),
                awards: awardsText.split(/\r?\n/).map((v) => v.trim()).filter(Boolean),
            });

            await refresh();
            show({ title: "Profile updated", description: "Your settings have been saved.", variant: "success" });
        } catch (error: any) {
            show({ title: "Save failed", description: error?.message || "Unable to save profile.", variant: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendResetLink = async () => {
        const email = userData?.email || auth.currentUser?.email;
        if (!email) {
            show({ title: "Unable to reset password", description: "Your account email is not available.", variant: "error" });
            return;
        }

        try {
            setIsSendingReset(true);
            await resetPassword(email);
            show({ title: "Reset email sent", description: `Password reset instructions were sent to ${email}.`, variant: "success" });
        } catch (error: any) {
            show({ title: "Reset failed", description: error?.message || "Could not send reset email.", variant: "error" });
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
            show({ title: "Passwords do not match", description: "New password and confirm password must match.", variant: "error" });
            return;
        }

        try {
            setIsChangingPassword(true);
            await changePassword(currentPassword, newPassword);

            let emailNoticeSent = false;
            const email = userData?.email || auth.currentUser?.email;
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
            show({ title: "Change failed", description: error?.message || "Failed to change password.", variant: "error" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500">Manage your profile, portfolio, and preferences.</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <User className="w-4 h-4 mr-2" />
                        Profile & Portfolio
                    </TabsTrigger>
                    <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <Shield className="w-4 h-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-[#6C5DD3] data-[state=active]:text-white">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">About You</h3>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group">
                                <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <AvatarImage src={photoDataUrl || profile?.photoDataUrl} alt="Profile" />
                                    <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-bold">{initials}</AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <Camera className="w-8 h-8 text-white" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500">Click on your photo to change it</p>
                                <p className="text-xs text-slate-400 mt-1">Max size: 5MB • JPG, PNG, or GIF</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Field of Major</Label>
                                <FieldOfMajorSelect
                                    value={fieldOfMajorId}
                                    onValueChange={(next) => {
                                        setFieldOfMajorId(next);
                                        if (degree && !degreeBelongsToField(degree, next)) {
                                            setDegree("");
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Major / Degree</Label>
                                <DropdownMenu
                                    open={isDegreeDropdownOpen}
                                    onOpenChange={(open) => {
                                        if (!fieldOfMajorId && open) return;
                                        setIsDegreeDropdownOpen(open);
                                    }}
                                >
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={!fieldOfMajorId}
                                            className={`w-full h-10 min-w-0 overflow-hidden justify-start text-left font-normal rounded-xl hover:bg-slate-50 ${
                                                degreeNotOfferedAtUniversity
                                                    ? "border-amber-400 bg-amber-50/50"
                                                    : "border-slate-200"
                                            }`}
                                        >
                                            <span className="truncate block w-full" title={degree || undefined}>
                                                {degree || "Select your degree..."}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="bg-white w-[400px] rounded-xl shadow-xl border-slate-100 p-0">
                                        <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search degrees..."
                                                    value={degreeSearch}
                                                    onChange={(e) => setDegreeSearch(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    className="pl-9 h-9 rounded-lg border-slate-200 focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {availableDegrees
                                                .filter(d => d.toLowerCase().includes(degreeSearch.toLowerCase()))
                                                .map((degreeOption) => (
                                                    <DropdownMenuItem
                                                        key={degreeOption}
                                                        onClick={() => {
                                                            setDegree(degreeOption);
                                                            setDegreeSearch("");
                                                            setIsDegreeDropdownOpen(false);
                                                        }}
                                                        className="font-medium text-slate-600 focus:bg-indigo-50 focus:text-[#6C5DD3] cursor-pointer py-2.5 px-3"
                                                    >
                                                        {degreeOption}
                                                    </DropdownMenuItem>
                                                ))}
                                            {availableDegrees
                                                .filter(d => d.toLowerCase().includes(degreeSearch.toLowerCase()))
                                                .length === 0 && (
                                                <div className="p-4 text-sm text-slate-400 text-center">
                                                    {!fieldOfMajorId
                                                        ? "Select a field of major first"
                                                        : university
                                                            ? availableDegrees.length === 0
                                                                ? `No degrees match your field and ${university}. Try a different university or field.`
                                                                : `No matching degrees for this field at ${university}`
                                                            : "Select a university first"}
                                                </div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-2">
                                <Label>Current Academic Year</Label>
                                <Select value={String(currentYear)} onValueChange={(val) => setCurrentYear(parseInt(val))}>
                                    <SelectTrigger className="rounded-xl h-10">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="1" className="rounded-lg cursor-pointer">1st Year</SelectItem>
                                        <SelectItem value="2" className="rounded-lg cursor-pointer">2nd Year</SelectItem>
                                        <SelectItem value="3" className="rounded-lg cursor-pointer">3rd Year</SelectItem>
                                        <SelectItem value="4" className="rounded-lg cursor-pointer">4th Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Current GPA</Label>
                                <Input value={gpa} onChange={(e) => setGpa(e.target.value)} className="rounded-xl" placeholder="e.g. 3.8" />
                            </div>
                            <div className="space-y-2">
                                <Label>University</Label>
                                <DropdownMenu open={isUniversityDropdownOpen} onOpenChange={setIsUniversityDropdownOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-10 min-w-0 overflow-hidden justify-start text-left font-normal rounded-xl border-slate-200 hover:bg-slate-50"
                                        >
                                            <span className="truncate block w-full">
                                                {university || "Select your university..."}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="bg-white w-[400px] rounded-xl shadow-xl border-slate-100 p-0">
                                        <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search universities..."
                                                    value={universitySearch}
                                                    onChange={(e) => setUniversitySearch(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    className="pl-9 h-9 rounded-lg border-slate-200 focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {ALL_UNIVERSITIES
                                                .filter(u => u.toLowerCase().includes(universitySearch.toLowerCase()))
                                                .map((uni) => (
                                                    <DropdownMenuItem
                                                        key={uni}
                                                        onClick={() => {
                                                            setUniversity(uni);
                                                            setUniversitySearch("");
                                                            setIsUniversityDropdownOpen(false);
                                                            const nextDegrees = fieldOfMajorId
                                                                ? getDegreesForUniversity(uni).filter((d) =>
                                                                      getDegreesForFieldOfMajor(fieldOfMajorId).includes(d)
                                                                  )
                                                                : getDegreesForUniversity(uni);
                                                            if (degree && !nextDegrees.includes(degree)) {
                                                                setDegree("");
                                                            }
                                                        }}
                                                        className="font-medium text-slate-600 focus:bg-indigo-50 focus:text-[#6C5DD3] cursor-pointer py-2.5 px-3"
                                                    >
                                                        {uni}
                                                    </DropdownMenuItem>
                                                ))}
                                            {ALL_UNIVERSITIES
                                                .filter(u => u.toLowerCase().includes(universitySearch.toLowerCase()))
                                                .length === 0 && (
                                                <div className="p-4 text-sm text-slate-400 text-center">
                                                    No universities found
                                                </div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {degreeNotOfferedAtUniversity && (
                                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        <span className="font-medium">{degree}</span> is not offered at{" "}
                                        <span className="font-medium">{university}</span>. Please select a matching
                                        degree from the Major / Degree field.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Graduation Year</Label>
                                <Select value={gradYear} onValueChange={setGradYear}>
                                    <SelectTrigger className="rounded-xl h-10">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl max-h-60">
                                        {GRADUATION_YEARS.map((year) => (
                                            <SelectItem key={year} value={String(year)} className="rounded-lg cursor-pointer">
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Certifications (one per line)</Label>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
                                    value={certificationsText}
                                    onChange={(e) => setCertificationsText(e.target.value)}
                                    placeholder="Meta Front-End Developer - Coursera (2025)"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Awards & Honors (one per line)</Label>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
                                    value={awardsText}
                                    onChange={(e) => setAwardsText(e.target.value)}
                                    placeholder="Dean's List - University of Colombo (2024)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button variant="outline" className="rounded-xl h-12 px-8" onClick={refresh} disabled={loading || isSaving}>Reload</Button>
                        <Button className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8] h-12 px-8" onClick={handleSave} disabled={loading || isSaving}>
                            {isSaving ? "Saving Profile..." : "Save Profile"}
                        </Button>
                    </div>
                </TabsContent>

                {/* Keep existing tabs logic for completeness, simplified for brevity here since we focus on Profile */}
                <TabsContent value="account" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Account Security</h3>
                        <p className="text-sm text-slate-500 mb-4">Change your password securely or request a reset link.</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded-xl" type="button" onClick={() => setShowChangePasswordModal(true)}>
                                Change Password
                            </Button>
                            <Button variant="ghost" className="rounded-xl" type="button" onClick={handleSendResetLink} disabled={isSendingReset}>
                                {isSendingReset ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Email Notifications</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Job Alerts</span>
                                <Switch defaultChecked={true} />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {showChangePasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowChangePasswordModal(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Change Password</h3>
                        <p className="text-sm text-slate-500 mb-5">Enter your current password and choose a new one.</p>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>Current Password</Label>
                                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                                <Label>New Password</Label>
                                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                                <Label>Confirm New Password</Label>
                                <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="rounded-xl" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" type="button" onClick={() => setShowChangePasswordModal(false)} disabled={isChangingPassword}>Cancel</Button>
                            <Button type="button" className="bg-[#6C5DD3] hover:bg-[#5b4eb8]" onClick={handleConfirmPasswordChange} disabled={isChangingPassword}>
                                {isChangingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Switch({ defaultChecked }: { defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked || false);
    return (
        <button
            onClick={() => setChecked(!checked)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${checked ? "bg-[#6C5DD3]" : "bg-slate-200"}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </button>
    );
}

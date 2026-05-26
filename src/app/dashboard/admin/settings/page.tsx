"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Bell, Settings as SettingsIcon, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>

            <Tabs defaultValue="platform" className="w-full">
                <TabsList className="bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <TabsTrigger value="platform" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Platform
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <Shield className="w-4 h-4 mr-2" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="platform" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Platform Configuration</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">User Registration</p>
                                    <p className="text-sm text-slate-500">Allow new users to sign up.</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">Company Verification</p>
                                    <p className="text-sm text-slate-500">Require manual verification for new companies.</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900 text-red-600">Maintenance Mode</p>
                                    <p className="text-sm text-slate-500">Disable access for all non-admin users.</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800" onClick={handleSave} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-6">System Alerts</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">New User Reports</p>
                                    <p className="text-sm text-slate-500">Notify when a user is reported.</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">Server Downtime</p>
                                    <p className="text-sm text-slate-500">Critical alerts for system outages.</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Admin Security</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-pw">Current Password</Label>
                                <Input id="current-pw" type="password" className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-pw">New Password</Label>
                                <Input id="new-pw" type="password" className="rounded-xl" />
                            </div>
                            <Button className="mt-2 rounded-xl bg-slate-900 text-white">Update Password</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Minimal Switch component reuse
function Switch({ defaultChecked }: { defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked || false);
    return (
        <button
            onClick={() => setChecked(!checked)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${checked ? "bg-slate-900" : "bg-slate-200"}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </button>
    );
}

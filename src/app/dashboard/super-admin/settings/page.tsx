"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Key, Users } from "lucide-react";

export default function SuperAdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-2xl font-extrabold text-slate-800">System Configuration (Super Admin)</h1>

            <Tabs defaultValue="system" className="w-full">
                <TabsList className="bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <Database className="w-4 h-4 mr-2" /> System
                    </TabsTrigger>
                    <TabsTrigger value="access" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <Users className="w-4 h-4 mr-2" /> Access Control
                    </TabsTrigger>
                    <TabsTrigger value="apikeys" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <Key className="w-4 h-4 mr-2" /> API Keys
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Environment Variables</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">NODE_ENV</p>
                                    <Input defaultValue="production" disabled className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">DATABASE_URL</p>
                                    <Input defaultValue="postgresql://db:5432/gradgateway" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">STRIPE_KEY</p>
                                    <Input defaultValue="sk_live_..." type="password" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">AWS_REGION</p>
                                    <Input defaultValue="us-east-1" />
                                </div>
                            </div>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Update Configuration</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="access" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Admin Management</h3>
                        <p className="text-sm text-slate-500 mb-4">Manage access levels for system administrators.</p>
                        <div className="space-y-2">
                            {["Admin Role - Full Access", "Moderator - User Management Only", "Analyst - Read Only"].map((role, i) => (
                                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                                    <span className="text-sm font-medium">{role}</span>
                                    <Button variant="outline" size="sm">Edit Permissions</Button>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl">Create New Role</Button>
                    </div>
                </TabsContent>

                <TabsContent value="apikeys" className="mt-6 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">API Integrations</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-sm">SendGrid API</p>
                                    <p className="text-xs text-slate-500">Last used: 2m ago</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Regenerate</Button>
                                    <Button variant="destructive" size="sm">Revoke</Button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-sm">Google Maps API</p>
                                    <p className="text-xs text-slate-500">Last used: 1h ago</p>
                                </div>
                                <Button variant="outline" size="sm">Configure</Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

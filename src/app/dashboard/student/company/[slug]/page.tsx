"use client";

import { use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    MapPin,
    Globe,
    Users,
    Briefcase,
    ExternalLink,
    MessageSquare,
    Bookmark
} from "lucide-react";
import Link from "next/link";

export default function StudentCompanyView(props: { params: Promise<{ slug: string }> }) {
    const params = use(props.params);
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "TechCorp Solutions";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Company Header Card */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-[#6C5DD3] rounded-[24px] flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-indigo-100">
                            {name[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{name}</h1>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg">Verified</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> Technology</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Colombo, Sri Lanka</span>
                                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> 500+ Employees</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline">
                            <Bookmark className="w-4 h-4 mr-2" /> Follow
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard/student/messages"><MessageSquare className="w-4 h-4 mr-2" /> Contact</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: About & Info */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">About the Company</h2>
                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Leading software innovation company specializing in enterprise solutions and AI integration.
                                We are passionate about nurturing young talent and building the future of tech.
                                Our mission is to transform businesses through digital excellence.
                            </p>
                            <p className="text-slate-600 leading-relaxed text-lg mt-4">
                                At {name}, we believe in a culture of continuous learning and innovation.
                                We provide our interns and junior developers with real-world projects and mentorship
                                from some of the best minds in the industry.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Founded</p>
                                <p className="font-bold text-slate-800">2012</p>
                            </div>
                            <div className="text-center border-l border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Projects</p>
                                <p className="font-bold text-slate-800">250+</p>
                            </div>
                            <div className="text-center border-l border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Awards</p>
                                <p className="font-bold text-slate-800">12</p>
                            </div>
                            <div className="text-center border-l border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Rating</p>
                                <p className="font-bold text-emerald-600">4.8/5.0</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-800">Featured Openings</h2>
                            <Button asChild variant="link">
                                <Link href="/dashboard/student/openings">View all openings <ExternalLink className="w-3.5 h-3.5 ml-1.5" /></Link>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Senior Software Engineer", type: "Full-time", loc: "Remote" },
                                { title: "Product Design Intern", type: "Internship", loc: "Colombo" },
                                { title: "QA Engineer", type: "Full-time", loc: "Kandy" },
                            ].map((job) => (
                                <div key={job.title} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{job.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{job.type} • {job.loc}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Apply Now</Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Rail */}
                <div className="space-y-8">
                    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Contact Info</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Website</p>
                                    <a href="#" className="text-sm font-bold text-slate-700 hover:text-[#6C5DD3]">www.techcorp.sl</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="text-sm font-bold text-slate-700">hr@techcorp.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Location</p>
                                    <p className="text-sm font-bold text-slate-700">Level 12, World Trade Center, Colombo 01</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-[32px] p-8 text-white">
                        <h3 className="text-lg font-bold mb-4">Why join us?</h3>
                        <ul className="space-y-4">
                            {[
                                "Health insurance & wellness",
                                "Flexible working hours",
                                "Modern office in heart of city",
                                "Free lunch & snacks",
                                "Unlimited learning budget",
                            ].map((perk) => (
                                <li key={perk} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                    <div className="w-1.5 h-1.5 bg-[#6C5DD3] rounded-full" />
                                    {perk}
                                </li>
                            ))}
                        </ul>
                        <Button className="w-full mt-8">
                            Join our team
                        </Button>
                    </section>
                </div>
            </div>
        </div>
    );
}

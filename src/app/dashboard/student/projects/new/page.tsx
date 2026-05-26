"use client";

import { ArrowLeft, Upload, X, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { StorageService } from "@/lib/services/storage.service";
import { useToast } from "@/components/ui/toast";
import { API_URL } from "@/lib/config";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_TECHS = [
    "React", "Node.js", "Python", "Java", "TypeScript",
    "Machine Learning", "UI/UX Design", "Flutter", "DevOps",
    "Spring Boot", "PostgreSQL", "MongoDB", "AWS", "Docker",
    "Tailwind CSS", "Next.js", "Figma", "Vue.js", "Angular"
];

export default function NewProjectPage() {
    const router = useRouter();
    const { show } = useToast();
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [demoUrl, setDemoUrl] = useState("");

    const handleAddTech = (tech: string) => {
        if (!selectedTechs.includes(tech)) {
            setSelectedTechs([...selectedTechs, tech]);
        }
    };

    const removeTech = (techToRemove: string) => {
        setSelectedTechs(selectedTechs.filter(t => t !== techToRemove));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);
            setImageFiles([...imageFiles, file]);
            setImagePreviews([...imagePreviews, preview]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = await AuthService.getIdToken();
            if (!token) {
                show({
                    title: "Authentication Error",
                    description: "Please log in again to continue.",
                    variant: "error",
                    duration: 3000
                });
                setIsSubmitting(false);
                return;
            }

            // Upload images to Firebase Storage and get URLs
            let imageUrls: Array<{ url: string; mimeType: string }> = [];
            if (imageFiles.length > 0) {
                try {
                    // Generate a temporary project ID for organizing uploads
                    const tempProjectId = `project-${Date.now()}`;
                    const urls = await StorageService.uploadProjectImages(imageFiles, tempProjectId);
                    imageUrls = urls.map((url, index) => ({
                        url: url,
                        mimeType: imageFiles[index].type || "image/jpeg"
                    }));
                    show({
                        title: "Images Uploaded",
                        description: `${imageUrls.length} image(s) uploaded to Firebase successfully`,
                        variant: "success",
                        duration: 2000
                    });
                } catch (uploadError) {
                    show({
                        title: "Image Upload Failed",
                        description: uploadError instanceof Error ? uploadError.message : "Failed to upload images",
                        variant: "error",
                        duration: 3000
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            const projectData = {
                title: title,
                description: description,
                techStack: selectedTechs.join(", "),
                repositoryUrl: githubUrl || null,
                demoUrl: demoUrl || null,
                isPublic: true,
                images: imageUrls.length > 0 ? imageUrls : null
            };

            console.log("Sending project data:", projectData);

            const response = await fetch(`${API_URL}/api/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
            });

            console.log("Response status:", response.status);
            const responseData = await response.json();
            console.log("Response data:", responseData);

            if (!response.ok) {
                show({
                    title: "Error Creating Project",
                    description: responseData.message || response.statusText,
                    variant: "error",
                    duration: 4000
                });
                setIsSubmitting(false);
                return;
            }

            // Success - show notification and redirect
            show({
                title: "Success",
                description: "Project created successfully!",
                variant: "success",
                duration: 2500
            });
            
            setTimeout(() => {
                router.push("/dashboard/student/projects");
            }, 500);
        } catch (error) {
            console.error("Error creating project:", error);
            show({
                title: "Error Creating Project",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "error",
                duration: 4000
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="pl-0 text-slate-500 hover:text-slate-900 hover:bg-transparent group">
                    <Link href="/dashboard/student/projects">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Projects
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-800">Add New Project</h1>
                <p className="text-slate-500">Share your work with the community and potential employers.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g. E-Commerce Dashboard" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required 
                            className="rounded-xl h-12" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-600">
                                <option value="frontend">Front End</option>
                                <option value="backend">Back End</option>
                                <option value="fullstack">Full Stack</option>
                                <option value="mobile">Mobile App</option>
                                <option value="datascience">Data Science</option>
                                <option value="uiux">UI/UX Design</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Your Role</Label>
                            <Input id="role" placeholder="e.g. Lead Developer" className="rounded-xl h-12" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <textarea
                            id="desc"
                            placeholder="Describe your project..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="tech">Tech Stack</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" size="sm" variant="outline" className="h-8 border-[#6C5DD3] text-[#6C5DD3] hover:bg-[#6C5DD3] hover:text-white rounded-lg">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Tech
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white max-h-60 overflow-y-auto min-w-[200px] rounded-xl shadow-xl border-slate-100">
                                    {AVAILABLE_TECHS.filter(t => !selectedTechs.includes(t)).map((tech) => (
                                        <DropdownMenuItem key={tech} onClick={() => handleAddTech(tech)} className="font-medium text-slate-600 focus:bg-indigo-50 focus:text-[#6C5DD3] cursor-pointer py-2">
                                            {tech}
                                        </DropdownMenuItem>
                                    ))}
                                    {AVAILABLE_TECHS.filter(t => !selectedTechs.includes(t)).length === 0 && (
                                        <div className="p-2 text-xs text-slate-400 text-center">All techs added</div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="min-h-[60px] p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-wrap gap-2">
                            {selectedTechs.length > 0 ? (
                                selectedTechs.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="bg-white text-slate-700 border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 group">
                                        <span className="font-bold text-xs">{tech}</span>
                                        <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 group-hover:text-red-500 transition-colors" onClick={() => removeTech(tech)} />
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No technologies selected. Start by adding some.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="github">GitHub URL</Label>
                            <Input 
                                id="github" 
                                placeholder="https://github.com/..." 
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="rounded-xl h-12" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="demo">Live Demo URL</Label>
                            <Input 
                                id="demo" 
                                placeholder="https://..." 
                                value={demoUrl}
                                onChange={(e) => setDemoUrl(e.target.value)}
                                className="rounded-xl h-12" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Project Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imagePreviews.map((img, i) => (
                                <div key={i} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#6C5DD3] hover:bg-slate-50 transition-colors group">
                                <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-[#6C5DD3]" />
                                <span className="text-xs text-slate-500 font-medium group-hover:text-[#6C5DD3]">Upload Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" asChild className="rounded-xl h-12 px-6">
                        <Link href="/dashboard/student/projects">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-[#6C5DD3] hover:bg-[#5b4eb8] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-indigo-200">
                        {isSubmitting ? "Publishing..." : "Publish Project"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

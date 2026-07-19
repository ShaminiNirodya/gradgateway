"use client";

import { ArrowLeft, Upload, X, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { SkillsPicker } from "@/components/shared/SkillsPicker";
import { ProjectItem } from "@/lib/types/project";

const AVAILABLE_ROLES = [
    // Leadership Roles
    "Lead Developer", "Team Lead", "Technical Lead", "Project Lead", "Engineering Manager",
    "Product Manager", "Program Manager", "Scrum Master", "Agile Coach",
    
    // Development Roles
    "Full Stack Developer", "Frontend Developer", "Backend Developer", "Software Engineer",
    "Senior Developer", "Junior Developer", "Software Architect", "Solutions Architect",
    "DevOps Engineer", "Site Reliability Engineer", "Platform Engineer",
    
    // Specialized Development
    "Mobile Developer", "iOS Developer", "Android Developer", "React Native Developer",
    "Flutter Developer", "Game Developer", "Blockchain Developer", "Smart Contract Developer",
    "Embedded Systems Engineer", "Systems Engineer", "Database Developer",
    
    // Data & AI/ML
    "Data Scientist", "Data Engineer", "Data Analyst", "Machine Learning Engineer",
    "AI Engineer", "Research Scientist", "Business Intelligence Analyst",
    "Analytics Engineer", "MLOps Engineer",
    
    // Design & UX
    "UI/UX Designer", "Product Designer", "UX Researcher", "UI Designer",
    "Visual Designer", "Interaction Designer", "Design Lead", "Creative Director",
    
    // QA & Testing
    "QA Engineer", "Test Engineer", "Quality Assurance Lead", "Automation Engineer",
    "Performance Engineer", "Security Engineer", "Penetration Tester",
    
    // Other Technical Roles
    "Cloud Engineer", "Infrastructure Engineer", "Network Engineer",
    "Security Analyst", "Cybersecurity Specialist", "Technical Writer",
    "Developer Advocate", "Solutions Engineer", "Integration Engineer",
    "Release Manager", "Build Engineer", "Technical Consultant"
].sort();

export default function EditProjectPage() {
    const params = useParams();
    const id = String(params?.id || "");
    const router = useRouter();
    const { show } = useToast();

    // Form state
    const [project, setProject] = useState<ProjectItem | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<{ id: string; imageUrl: string }[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleSearch, setRoleSearch] = useState("");
    const [role, setRole] = useState("");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    const selectedTechSet = useMemo(() => new Set(selectedTechs), [selectedTechs]);

    const toggleTech = (tech: string) => {
        setSelectedTechs((prev) =>
            prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
        );
    };

    useEffect(() => {
        const loadProject = async () => {
            // Ensure we have an id before attempting to load
            if (!id || id === "") {
                console.log("No project ID available yet");
                return;
            }

            try {
                setIsLoading(true);
                const token = await AuthService.getIdToken();
                if (!token) {
                    throw new Error("No authentication token available");
                }

                console.log("Fetching project with ID:", id);
                const response = await fetch(`${API_URL}/api/projects/me/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API error response:", response.status, errorText);
                    throw new Error(`Failed to load project: ${response.status}`);
                }

                const data = await response.json();
                console.log("Project data loaded:", data);
                setProject(data);

                // Populate form with project data
                setTitle(data.title || "");
                setDescription(data.description || "");
                setGithubUrl(data.repositoryUrl || "");
                setDemoUrl(data.demoUrl || "");
                setSelectedTechs(data.techStack ? data.techStack.split(", ").filter((t: string) => t) : []);
                setExistingImages((data.images || []).map((img: any) => ({ id: img.id, imageUrl: img.imageUrl })));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load project details";
                console.error("Error loading project:", error);
                console.error("API_URL being used:", API_URL);
                
                // Better error diagnostics
                let displayMessage = errorMessage;
                if (errorMessage.includes("Failed to fetch")) {
                    displayMessage = `Cannot connect to backend at ${API_URL}. Please ensure:\n1. Backend is running (dotnet run)\n2. No firewall is blocking localhost:5160\n3. Check browser console for CORS errors`;
                }
                
                show({
                    title: "Error",
                    description: displayMessage,
                    variant: "error"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadProject();
    }, [id, show]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const preview = URL.createObjectURL(file);
                setNewImageFiles([...newImageFiles, file]);
                setNewImagePreviews([...newImagePreviews, preview]);
            }
        }
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId: string) => {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        setImagesToDelete([...imagesToDelete, imageId]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = await AuthService.getIdToken();
            if (!token) {
                show({
                    title: "Authentication Error",
                    description: "Please log in again",
                    variant: "error"
                });
                setIsSubmitting(false);
                return;
            }

            // Upload new images to Firebase
            let newImageUrls: Array<{ url: string; mimeType: string }> = [];
            if (newImageFiles.length > 0) {
                try {
                    const urls = await StorageService.uploadProjectImages(newImageFiles, id);
                    newImageUrls = urls.map((url, index) => ({
                        url: url,
                        mimeType: newImageFiles[index].type || "image/jpeg"
                    }));
                } catch (uploadError) {
                    show({
                        title: "Image Upload Failed",
                        description: uploadError instanceof Error ? uploadError.message : "Failed to upload images",
                        variant: "error"
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            // Prepare update payload
            const updateData = {
                title,
                description,
                techStack: selectedTechs.join(", "),
                repositoryUrl: githubUrl || null,
                demoUrl: demoUrl || null,
                isPublic: project?.isPublic ?? true,
                newImages: newImageUrls.length > 0 ? newImageUrls : null,
                deleteImageIds: imagesToDelete.length > 0 ? imagesToDelete : null
            };

            const response = await fetch(`${API_URL}/api/projects/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                // Try parse JSON error response, fall back to plain text
                let errorMsg = "Failed to update project";
                try {
                    const err = await response.json();
                    errorMsg = err?.message || JSON.stringify(err);
                } catch (parseErr) {
                    try {
                        const text = await response.text();
                        errorMsg = text || errorMsg;
                    } catch { /* ignore */ }
                }

                throw new Error(errorMsg);
            }

            show({
                title: "Success",
                description: "Project updated successfully!",
                variant: "success"
            });

            setTimeout(() => {
                router.push(`/dashboard/student/projects/${id}`);
            }, 500);
        } catch (error) {
            show({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update project",
                variant: "error"
            });
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="bg-white rounded-2xl p-8 shadow-sm">Loading project...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 space-y-8">
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="pl-0 text-slate-500 hover:text-slate-900 group">
                    <Link href={`/dashboard/student/projects/${id}`}>
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Project
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Project</h1>
                <p className="text-slate-500">Update your project details and images.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input 
                        id="title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required 
                        className="rounded-xl h-12" 
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                        required
                    />
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub URL</Label>
                        <Input 
                            id="github"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/..."
                            className="rounded-xl h-12" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="demo">Demo URL</Label>
                        <Input 
                            id="demo"
                            type="url"
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                            placeholder="https://..."
                            className="rounded-xl h-12" 
                        />
                    </div>
                </div>

                <SkillsPicker
                    variant="tags"
                    label="Tech Stack"
                    addButtonLabel="Add Tech"
                    selected={selectedTechSet}
                    onToggle={toggleTech}
                    menuAlign="end"
                    tagsContainerClassName="flex-wrap gap-2 border-0 bg-transparent p-0 min-h-0 shadow-none"
                    emptyMessage="No technologies selected."
                />

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="space-y-3">
                        <Label>Existing Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {existingImages.map(img => (
                                <div key={img.id} className="relative rounded-lg overflow-hidden border border-slate-200">
                                    <img src={img.imageUrl} alt="Project" className="w-full h-32 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images */}
                <div className="space-y-3">
                    <Label>Add New Images</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-slate-300 transition-colors cursor-pointer">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-input"
                        />
                        <label htmlFor="image-input" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                            <p className="text-sm font-medium text-slate-700">Click to upload images</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </label>
                    </div>

                    {newImagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                            {newImagePreviews.map((preview, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200">
                                    <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(i)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#6C5DD3] hover:bg-[#5b4eb8]">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/dashboard/student/projects/${id}`}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

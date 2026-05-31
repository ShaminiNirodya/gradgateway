"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyInfoSchema,
  CompanyInfoData,
} from "@/lib/validators/company-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Globe, Briefcase, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDUSTRIES = [
  "Software & IT",
  "Finance",
  "Education",
  "Healthcare",
  "E-commerce",
  "Manufacturing",
];

interface Step1Props {
  onNext: (data: CompanyInfoData & { logoFile?: File }) => void;
  defaultValues?: Partial<CompanyInfoData>;
}

export default function Step1Company({ onNext, defaultValues }: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>((defaultValues as any)?.logoDataUrl ?? null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CompanyInfoData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: defaultValues || {
      companyName: "",
      companyEmail: "",
      phone: "+94",
      website: "",
      industry: "",
      logoDataUrl: (defaultValues as any)?.logoDataUrl,
    },
  });

  // Restore logo from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("register.company.logo");
      if (saved && !preview) {
        setPreview(saved);
        setValue("logoDataUrl", saved, { shouldValidate: false, shouldDirty: false });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      alert("Image is too large. Please select a file under 2MB.");
      e.target.value = "";
      return;
    }
    
    // Store the file for later upload
    setLogoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setPreview(url);
      setValue("logoDataUrl", url, { shouldValidate: false, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: CompanyInfoData) => {
    // Pass both form data and the file object
    onNext({ ...data, logoFile: logoFile || undefined });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Company Logo Uploader */}
      <div className="flex flex-col items-center justify-center mb-8">
        <button type="button" onClick={onPickFile} className="relative group cursor-pointer outline-none">
          <div className="w-28 h-28 rounded-2xl bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Company logo preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-10 h-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
            <div className="text-lg leading-none mb-0.5">+</div>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        <input type="hidden" {...register("logoDataUrl")} />
        <span className="text-sm font-bold text-slate-500 mt-3">Upload Company Logo</span>
      </div>

      <div className="space-y-5">
        {/* Company Name */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Company Name</Label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("companyName")}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="e.g. TechForge (Pvt) Ltd"
            />
          </div>
          {errors.companyName && (
            <p className="text-xs text-red-500 font-bold ml-2">
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Company Email */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Company Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("companyEmail")}
              type="email"
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="recruitment@company.com"
            />
          </div>
          {errors.companyEmail && (
            <p className="text-xs text-red-500 font-bold ml-2">
              {errors.companyEmail.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Contact Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("phone")}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="+94 11 234 5678"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 font-bold ml-2">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Website</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("website")}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="https://company.lk"
            />
          </div>
          {errors.website && (
            <p className="text-xs text-red-500 font-bold ml-2">
              {errors.website.message}
            </p>
          )}
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Industry</Label>
          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-blue-600 data-[state=open]:border-blue-600">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <SelectValue placeholder="Select Industry" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i} className="rounded-lg my-1 cursor-pointer">
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.industry && (
            <p className="text-xs text-red-500 font-bold ml-2">
              {errors.industry.message}
            </p>
          )}
        </div>
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
        >
          Continue
        </Button>
      </div>
    </motion.form>
  );
}

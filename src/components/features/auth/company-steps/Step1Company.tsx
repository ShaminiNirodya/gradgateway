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
import { Building2, Mail, Phone, Globe, Briefcase } from "lucide-react";
import RegistrationStepHeader from "@/components/features/auth/RegistrationStepHeader";
import PhotoUploadField from "@/components/features/auth/PhotoUploadField";
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
    onNext({ ...data, logoFile: logoFile || undefined });
  };

  const inputClass =
    "h-14 rounded-2xl border-slate-200/80 bg-slate-50/80 pl-12 font-medium text-slate-700 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/15";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <RegistrationStepHeader
        accent="company"
        title="Company profile"
        description="Share your organization details so students can trust who they're applying to."
      />

      <PhotoUploadField
        preview={preview}
        label="Upload company logo"
        shape="square"
        accent="company"
        onPick={onPickFile}
      />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      <input type="hidden" {...register("logoDataUrl")} />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Company Name</Label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("companyName")} className={inputClass} placeholder="e.g. TechForge (Pvt) Ltd" />
          </div>
          {errors.companyName && (
            <p className="ml-2 text-xs font-bold text-red-500">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Company Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("companyEmail")} type="email" className={inputClass} placeholder="recruitment@company.com" />
          </div>
          {errors.companyEmail && (
            <p className="ml-2 text-xs font-bold text-red-500">{errors.companyEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Contact Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("phone")} className={inputClass} placeholder="+94 11 234 5678" />
          </div>
          {errors.phone && <p className="ml-2 text-xs font-bold text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Website</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("website")} className={inputClass} placeholder="https://company.lk" />
          </div>
          {errors.website && <p className="ml-2 text-xs font-bold text-red-500">{errors.website.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Industry</Label>
          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-14 rounded-2xl border-slate-200/80 bg-slate-50/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 data-[state=open]:border-blue-600">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <SelectValue placeholder="Select industry" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i} className="my-1 cursor-pointer rounded-lg">
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.industry && <p className="ml-2 text-xs font-bold text-red-500">{errors.industry.message}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-200/60 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Continue to contact details
        </Button>
      </div>
    </motion.form>
  );
}

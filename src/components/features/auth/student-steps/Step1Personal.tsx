"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfoData } from "@/lib/validators/student-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import RegistrationStepHeader from "@/components/features/auth/RegistrationStepHeader";
import PhotoUploadField from "@/components/features/auth/PhotoUploadField";

interface Step1Props {
  onNext: (data: PersonalInfoData & { photoFile?: File }) => void;
  defaultValues?: Partial<PersonalInfoData>;
}

export default function Step1Personal({ onNext, defaultValues }: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(
    (defaultValues as PersonalInfoData & { photoDataUrl?: string })?.photoDataUrl ?? null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "+94",
      photoDataUrl: (defaultValues as PersonalInfoData & { photoDataUrl?: string })?.photoDataUrl,
    },
  });

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert("Image is too large. Please select a file under 2MB.");
      e.target.value = "";
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setPreview(url);
      setValue("photoDataUrl", url, { shouldValidate: false, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: PersonalInfoData) => {
    onNext({ ...data, photoFile: photoFile || undefined });
  };

  const inputClass =
    "h-14 rounded-2xl border-slate-200/80 bg-slate-50/80 pl-12 font-medium text-slate-700 transition-all focus:border-[#6C5DD3] focus:bg-white focus:ring-2 focus:ring-[#6C5DD3]/15";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <RegistrationStepHeader
        accent="student"
        title="Personal details"
        description="Add a photo and contact information so recruiters can recognize and reach you."
      />

      <PhotoUploadField preview={preview} label="Upload profile photo" onPick={onPickFile} accent="student" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      <input type="hidden" {...register("photoDataUrl")} />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Full Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("fullName")} className={inputClass} placeholder="e.g. Kasun Perera" />
          </div>
          {errors.fullName && <p className="ml-2 text-xs font-bold text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("email")} className={inputClass} placeholder="kasun@example.com" />
          </div>
          {errors.email && <p className="ml-2 text-xs font-bold text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="ml-1 font-bold text-slate-600">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input {...register("phone")} className={inputClass} placeholder="+94 77 123 4567" />
          </div>
          {errors.phone && <p className="ml-2 text-xs font-bold text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="h-14 w-full rounded-2xl bg-[#6C5DD3] text-lg font-bold text-white shadow-lg shadow-indigo-200/60 transition-all hover:-translate-y-0.5 hover:bg-[#5b4eb8]"
        >
          Continue to academic info
        </Button>
      </div>
    </motion.form>
  );
}

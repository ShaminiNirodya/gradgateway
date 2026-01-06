"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfoData } from "@/lib/validators/student-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface Step1Props {
  onNext: (data: PersonalInfoData) => void;
  defaultValues?: Partial<PersonalInfoData>;
}

export default function Step1Personal({ onNext, defaultValues }: Step1Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultValues || { fullName: "", email: "", phone: "+94" }
  });

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onNext)} 
      className="space-y-6"
    >
      {/* Profile Photo Uploader */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <Camera className="w-10 h-10 text-slate-300 group-hover:text-[#6C5DD3] transition-colors" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#6C5DD3] rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
            <div className="text-lg leading-none mb-0.5">+</div>
          </div>
        </div>
        <span className="text-sm font-bold text-slate-500 mt-3">Upload Photo</span>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Full Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              {...register("fullName")} 
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700" 
              placeholder="e.g. Kasun Perera" 
            />
          </div>
          {errors.fullName && <p className="text-xs text-red-500 font-bold ml-2">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              {...register("email")} 
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700" 
              placeholder="kasun@example.com" 
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 font-bold ml-2">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              {...register("phone")} 
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700" 
              placeholder="+94 77 123 4567" 
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 font-bold ml-2">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full h-14 rounded-2xl bg-[#6C5DD3] hover:bg-[#5b4eb8] text-white text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1">
          Continue
        </Button>
      </div>
    </motion.form>
  );
}

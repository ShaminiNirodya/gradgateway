"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfoData } from "@/lib/validators/student-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, User, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface Step1Props {
  onNext: (data: PersonalInfoData) => void;
  defaultValues?: Partial<PersonalInfoData>;
}

export default function Step1Personal({ onNext, defaultValues }: Step1Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultValues || {
      fullName: "",
      email: "",
      phone: "+94",
    }
  });

  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit(onNext)} 
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Profile Picture Upload Stub */}
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-violet-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-violet-500" />
            </div>
            <span className="text-xs text-slate-500 mt-2 block text-center">Upload Photo</span>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input id="fullName" {...register("fullName")} className="pl-10" placeholder="e.g. Kasun Perera" />
          </div>
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input id="email" type="email" {...register("email")} className="pl-10" placeholder="kasun@example.com" />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input id="phone" {...register("phone")} className="pl-10" placeholder="+94 77 123 4567" />
          </div>
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-base">
          Next: Academic Info
        </Button>
      </div>
    </motion.form>
  );
}

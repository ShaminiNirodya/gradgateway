"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recruiterInfoSchema,
  RecruiterInfoData,
} from "@/lib/validators/company-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import RegistrationStepHeader from "@/components/features/auth/RegistrationStepHeader";

interface Step2Props {
  onNext: (data: RecruiterInfoData) => void;
  onBack: () => void;
  defaultValues?: Partial<RecruiterInfoData>;
}

export default function Step2Recruiter({ onNext, onBack, defaultValues }: Step2Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterInfoData>({
    resolver: zodResolver(recruiterInfoSchema),
    defaultValues: {
      recruiterName: defaultValues?.recruiterName ?? "",
      recruiterEmail: defaultValues?.recruiterEmail ?? "",
      recruiterPhone: defaultValues?.recruiterPhone ?? "+94",
      position: defaultValues?.position ?? "",
    },
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onNext)}
      className="space-y-6"
    >
      <RegistrationStepHeader
        accent="company"
        title="Recruiter contact"
        description="Tell candidates who they'll hear from when they apply or receive an offer."
      />

      <div className="space-y-5">
        {/* Recruiter Name */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Recruiter / Contact Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("recruiterName")}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="e.g. Nirmal Fernando"
            />
          </div>
          {errors.recruiterName && (
            <p className="text-xs text-red-500 font-bold ml-2">{errors.recruiterName.message}</p>
          )}
        </div>

        {/* Recruiter Email */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Work Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("recruiterEmail")}
              type="email"
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="nirmal@company.com"
            />
          </div>
          {errors.recruiterEmail && (
            <p className="text-xs text-red-500 font-bold ml-2">{errors.recruiterEmail.message}</p>
          )}
        </div>

        {/* Recruiter Phone */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("recruiterPhone")}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="+94 77 123 4567"
            />
          </div>
          {errors.recruiterPhone && (
            <p className="text-xs text-red-500 font-bold ml-2">{errors.recruiterPhone.message}</p>
          )}
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Position</Label>
          <div className="relative">
            <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              {...register("position")}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-0 transition-all font-medium text-slate-700"
              placeholder="HR Manager"
            />
          </div>
          {errors.position && (
            <p className="text-xs text-red-500 font-bold ml-2">{errors.position.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-1/3 h-14 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-700"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-2/3 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg shadow-blue-200"
        >
          Next Step
        </Button>
      </div>
    </motion.form>
  );
}

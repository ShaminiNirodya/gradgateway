"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { securitySchema, SecurityData } from "@/lib/validators/student-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import RegistrationStepHeader from "@/components/features/auth/RegistrationStepHeader";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";

interface Step3Props {
  onComplete: (data: SecurityData) => void;
  onBack: () => void;
  defaultValues?: Partial<SecurityData>;
  isSubmitting?: boolean;
}

export default function Step3Security({ onComplete, onBack, defaultValues, isSubmitting }: Step3Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityData>({
    resolver: zodResolver(securitySchema),
    defaultValues,
  });

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onComplete)} 
      className="space-y-6"
    >
      <RegistrationStepHeader
        accent="student"
        title="Secure your account"
        description="Choose a strong password. You'll verify your email after signing in."
      />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input {...register("password")} type="password" className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium" placeholder="•••••••••" />
          </div>
          {errors.password && <p className="text-xs text-red-500 font-bold ml-2">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Confirm Password</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input {...register("confirmPassword")} type="password" className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium" placeholder="•••••••••" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 font-bold ml-2">{errors.confirmPassword.message}</p>}
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <p className="text-xs font-semibold leading-relaxed text-indigo-700">
            Use at least 8 characters with a mix of letters and numbers for a stronger password.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="ghost" onClick={onBack} className="h-14 w-1/3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700" disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} className="h-14 w-2/3 rounded-2xl bg-[#6C5DD3] text-lg font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#5b4eb8]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </div>
    </motion.form>
  );
}

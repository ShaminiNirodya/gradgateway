"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { securitySchema, SecurityData } from "@/lib/validators/student-register";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

interface Step3Props {
  onComplete: (data: SecurityData) => void;
  onBack: () => void;
}

export default function Step3Security({ onComplete, onBack }: Step3Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityData>({
    resolver: zodResolver(securitySchema)
  });

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onComplete)} 
      className="space-y-6"
    >
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

        <div className="bg-indigo-50 border-none rounded-2xl p-5">
          <p className="text-sm text-[#6C5DD3] font-medium leading-relaxed">
            We will send a 6-digit verification code to your email. Please check your inbox (and spam folder) after clicking Create Account.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button type="button" variant="ghost" onClick={onBack} className="w-1/3 h-14 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-700">Back</Button>
        <Button type="submit" className="w-2/3 h-14 rounded-2xl bg-[#6C5DD3] hover:bg-[#5b4eb8] text-white text-lg font-bold shadow-lg shadow-indigo-200">Create Account</Button>
      </div>
    </motion.form>
  );
}

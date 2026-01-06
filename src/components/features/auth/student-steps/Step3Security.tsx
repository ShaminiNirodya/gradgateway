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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit(onComplete)} 
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input id="password" type="password" {...register("password")} className="pl-10" placeholder="Min 8 characters" />
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="pl-10" placeholder="Re-enter password" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {/* OTP Simulation Note */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
          <p>We will send a 6-digit verification code to your email after you click Create Account.</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="w-1/3">
          Back
        </Button>
        <Button type="submit" className="w-2/3 bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
          Create Account
        </Button>
      </div>
    </motion.form>
  );
}

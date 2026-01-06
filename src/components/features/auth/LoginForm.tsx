"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "@/lib/validators/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  role: "student" | "company";
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log(`LOGIN AS ${role.toUpperCase()}:`, data);
      setIsLoading(false);
      
       if (role === "student") router.push("/student");
      else router.push("/dashboard/company");
      
    }, 1500);
  };

  return (
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
         <div className="space-y-5">
        
        {/* Email Field */}
        <div className="space-y-2">
             <Label htmlFor="email" className="text-slate-600 font-bold ml-1">
               {role === 'company' ? 'Company Email' : 'Email Address'}
             </Label>
          <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#6C5DD3] transition-colors" />
            <Input 
              id="email" 
              type="email" 
              {...register("email")} 
                 className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700 placeholder:text-slate-400" 
              placeholder={role === 'company' ? 'recruitment@company.com' : 'student@university.edu'} 
            />
          </div>
             {errors.email && <p className="text-xs text-red-500 font-bold ml-2">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
             <div className="flex items-center justify-between ml-1">
               <Label htmlFor="password" className="text-slate-600 font-bold">Password</Label>
            <Link 
              href="/forgot-password" 
                 className="text-xs font-bold text-[#6C5DD3] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#6C5DD3] transition-colors" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              {...register("password")} 
                 className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700 placeholder:text-slate-400" 
              placeholder="••••••••" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
             {errors.password && <p className="text-xs text-red-500 font-bold ml-2">{errors.password.message}</p>}
        </div>

        {/* Remember Me */}
           <div className="flex items-center space-x-3 ml-1">
             <Checkbox id="remember" {...register("rememberMe")} className="data-[state=checked]:bg-[#6C5DD3] data-[state=checked]:border-[#6C5DD3] border-slate-300 w-5 h-5 rounded-md" />
             <Label htmlFor="remember" className="text-sm font-semibold text-slate-500 cursor-pointer">
            Remember me
          </Label>
        </div>
      </div>

      <Button 
        type="submit" 
           className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all hover:-translate-y-1
             ${role === 'student' 
               ? 'bg-[#6C5DD3] hover:bg-[#5b4eb8] shadow-indigo-200 text-white' 
               : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white'
             }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          role === 'student' ? 'Login as Student' : 'Login to Dashboard'
        )}
      </Button>

    </form>
  );
}

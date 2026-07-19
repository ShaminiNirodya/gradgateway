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
import { useAuth } from "@/lib/contexts/AuthContext";
import { UserRole } from "@/lib/types/auth";

interface LoginFormProps {
  role: "student" | "company" | "admin";
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      const expectedRole: UserRole | undefined =
        role === "admin" ? "Admin" : role === "company" ? "Company" : "Student";
      const userData = await signIn(data.email, data.password, expectedRole);
      
      // Navigate based on the user's role from backend
      switch(userData.role) {
        case "Admin":
          router.push("/dashboard/admin");
          break;
        case "Student":
          router.push("/dashboard/student");
          break;
        case "Company":
          router.push("/dashboard/company");
          break;
        default:
          router.push("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle Firebase auth errors
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address");
      } else if (err.code === 'auth/user-disabled') {
        setError("This account has been disabled");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password");
      } else if (typeof err?.message === "string" && err.message.startsWith("Role mismatch:")) {
        setError(err.message.replace("Role mismatch: ", ""));
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = role === "admin";

  return (
       <form onSubmit={handleSubmit(onSubmit)} className={isAdmin ? "space-y-6" : "space-y-6 mt-6"}>
         <div className="space-y-5">
        
        {/* Email Field */}
        <div className="space-y-2">
             <Label
               htmlFor="email"
               className={`font-bold ml-1 ${isAdmin ? "text-slate-300" : "text-slate-600"}`}
             >
               {role === "company" ? "Company Email" : "Email Address"}
             </Label>
          <div className="relative group">
               <Mail
                 className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                   isAdmin
                     ? "text-slate-500 group-focus-within:text-slate-200"
                     : "text-slate-400 group-focus-within:text-[#6C5DD3]"
                 }`}
               />
            <Input 
              id="email" 
              type="email" 
              {...register("email")} 
                 className={
                   isAdmin
                     ? "pl-12 h-14 rounded-2xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-slate-500 focus:ring-0"
                     : "pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                 }
              placeholder={
                role === "company"
                  ? "recruitment@company.com"
                  : role === "admin"
                    ? "admin@gradgateway.com"
                    : "student@university.edu"
              }
            />
          </div>
             {errors.email && <p className="text-xs text-red-500 font-bold ml-2">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
             <div className="flex items-center justify-between ml-1">
               <Label
                 htmlFor="password"
                 className={`font-bold ${isAdmin ? "text-slate-300" : "text-slate-600"}`}
               >
                 Password
               </Label>
            <Link 
              href="/forgot-password" 
                 className={`text-xs font-bold hover:underline ${
                   isAdmin ? "text-slate-400 hover:text-slate-200" : "text-[#6C5DD3]"
                 }`}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
               <Lock
                 className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                   isAdmin
                     ? "text-slate-500 group-focus-within:text-slate-200"
                     : "text-slate-400 group-focus-within:text-[#6C5DD3]"
                 }`}
               />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              {...register("password")} 
                 className={
                   isAdmin
                     ? "pl-12 pr-12 h-14 rounded-2xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-slate-500 focus:ring-0"
                     : "pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                 }
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
           {!isAdmin && (
           <div className="flex items-center space-x-3 ml-1">
             <Checkbox id="remember" {...register("rememberMe")} className="data-[state=checked]:bg-[#6C5DD3] data-[state=checked]:border-[#6C5DD3] border-slate-300 w-5 h-5 rounded-md" />
             <Label htmlFor="remember" className="text-sm font-semibold text-slate-500 cursor-pointer">
            Remember me
          </Label>
        </div>
           )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
           className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all hover:-translate-y-1 text-white
             ${
               role === "student"
                 ? "bg-[#6C5DD3] hover:bg-[#5b4eb8] shadow-indigo-200"
                 : role === "admin"
                   ? "bg-white text-slate-900 hover:bg-slate-100 shadow-none"
                   : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
             }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          role === "student"
            ? "Login as Student"
            : role === "admin"
              ? "Login as Admin"
              : "Login to Dashboard"
        )}
      </Button>

    </form>
  );
}

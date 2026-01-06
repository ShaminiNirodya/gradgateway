import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/features/auth/LoginForm";
import { Compass, Briefcase, GraduationCap } from "lucide-react";

export default function LoginPage() {
  return (
     <div className="min-h-screen w-full grid lg:grid-cols-2 bg-[#F5F7FB] p-4 lg:p-6 gap-4">
     
       {/* =======================
           LEFT SIDE: Brand & Visuals 
       ======================= */}
       <div className="hidden lg:flex flex-col relative bg-[#6C5DD3] text-white p-12 xl:p-16 justify-between rounded-[40px] shadow-2xl shadow-indigo-200 overflow-hidden">
       
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 z-0">
              <Image 
                 src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                 alt="Students collaborating"
                 fill
                 className="object-cover opacity-40 mix-blend-multiply" 
                 priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#6C5DD3]/90 to-indigo-900/80" />
         </div>

         {/* Decorative Circles */}
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl z-0 pointer-events-none" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-2xl z-0 pointer-events-none" />

        <div className="relative z-10">
           <Link href="/" className="flex items-center gap-3 mb-16 w-fit group">
             <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:bg-white group-hover:text-[#6C5DD3] transition-all duration-300">
              <Compass className="w-6 h-6" />
            </div>
             <span className="font-bold text-3xl tracking-tight">GradGt.</span>
          </Link>
         
           <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
             Welcome back to <br/> 
             <span className="text-indigo-200">your future.</span>
          </h1>
           <p className="text-indigo-100 text-lg font-medium max-w-md leading-relaxed">
             Access your professional dashboard, manage your projects, and get discovered by top recruiters.
          </p>
        </div>

         <div className="relative z-10 flex items-center gap-6 text-sm font-semibold text-indigo-100/80">
            <span className="hover:text-white cursor-pointer transition-colors">© 2026 GradGateway</span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
        </div>
      </div>

       {/* =======================
           RIGHT SIDE: Login Form 
       ======================= */}
       <div className="flex flex-col justify-center items-center">
         {/* Main Card */}
         <div className="w-full max-w-[480px] bg-white p-10 sm:p-12 rounded-[40px] shadow-xl shadow-slate-200/60 border border-white relative">
         
           <div className="text-center mb-10">
             <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Sign In</h2>
             <p className="text-slate-400 font-medium">Enter your details to proceed</p>
          </div>

          <Tabs defaultValue="student" className="w-full">
             {/* Soft Toggle Switch */}
             <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#F5F7FB] p-2 rounded-[20px] h-auto">
              <TabsTrigger
                value="student"
                 className="rounded-2xl py-3 text-sm font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-[#6C5DD3] data-[state=active]:shadow-md transition-all ease-out duration-300"
              >
                <GraduationCap className="w-4 h-4 mr-2" /> Student
              </TabsTrigger>
              <TabsTrigger
                value="company"
                 className="rounded-2xl py-3 text-sm font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all ease-out duration-300"
              >
                <Briefcase className="w-4 h-4 mr-2" /> Company
              </TabsTrigger>
            </TabsList>

             <TabsContent value="student" className="animate-in fade-in-5 slide-in-from-bottom-2">
              <LoginForm role="student" />
            </TabsContent>

             <TabsContent value="company" className="animate-in fade-in-5 slide-in-from-bottom-2">
              <LoginForm role="company" />
            </TabsContent>
          </Tabs>

           <div className="mt-10 text-center">
              <p className="text-sm font-bold text-slate-400">
                 Not a member yet?{' '}
                 <Link href="/register/student" className="text-[#6C5DD3] hover:text-[#5b4eb8] hover:underline transition-colors">
                   Create an account
                 </Link>
              </p>
          </div>

        </div>
      </div>
    </div>
  );
}

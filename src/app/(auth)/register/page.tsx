import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="flex items-center gap-2.5 mb-8 w-fit group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
              <img src="/logo.svg" alt="GradGateway Logo" className="w-full h-full object-contain filter invert" />
            </div>
            <span className="font-bold text-xl text-slate-900">GradGateway</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Join GradGateway
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Whether you're a student looking for opportunities or a company seeking talent, get started with us today.
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Student Registration */}
          <Link href="/register/student">
            <div className="group h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1">
              {/* Header Background */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="absolute top-1/2 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 blur-3xl"></div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center -mt-20 shadow-lg">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">Student Registration</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Build your professional portfolio, showcase your projects, and connect with top companies looking for talented developers.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Create a stunning portfolio
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Showcase your projects & skills
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Get discovered by recruiters
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3">
                  Register as Student
                </Button>
              </div>
            </div>
          </Link>

          {/* Company Registration */}
          <Link href="/register/company">
            <div className="group h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1">
              {/* Header Background */}
              <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="absolute top-1/2 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 blur-3xl"></div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center -mt-20 shadow-lg">
                    <Briefcase className="w-8 h-8 text-cyan-600" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">Company Registration</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Access a pool of talented undergraduates, post job opportunities, and build your dream team with the best emerging talent.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                    Browse verified student profiles
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                    Post job & internship openings
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                    Find talent that fits your team
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3">
                  Register as Company
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

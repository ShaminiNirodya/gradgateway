
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

export default function RegisterPage() {

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight drop-shadow-sm">Join GradGateway</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Whether you're a student looking for opportunities or a company seeking talent, get started with us today.</p>
        </div>

        {/* Registration Options */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Student Registration */}
          <Link href="/register/student">
            <div className="group h-full bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200">
              <div className="p-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Student Registration</h2>
                <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                  Build your professional portfolio, showcase your projects, and connect with top companies looking for talented developers.
                </p>

                <ul className="space-y-4 mb-10">
                  <li className="text-slate-700 text-base">Create a stunning portfolio</li>
                  <li className="text-slate-700 text-base">Showcase your projects & skills</li>
                  <li className="text-slate-700 text-base">Get discovered by recruiters</li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-md">
                  Register as Student
                </Button>
              </div>
            </div>
          </Link>

          {/* Company Registration */}
          <Link href="/register/company">
            <div className="group h-full bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200">
              <div className="p-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Company Registration</h2>
                <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                  Access a pool of talented undergraduates, post job opportunities, and build your dream team with the best emerging talent.
                </p>

                <ul className="space-y-4 mb-10">
                  <li className="text-slate-700 text-base">Browse verified student profiles</li>
                  <li className="text-slate-700 text-base">Post job & internship openings</li>
                  <li className="text-slate-700 text-base">Find talent that fits your team</li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 text-lg shadow-md">
                  Register as Company
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center mt-10">
          <p className="text-slate-600 text-lg">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

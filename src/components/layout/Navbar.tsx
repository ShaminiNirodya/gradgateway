import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#F5F7FB]/80 backdrop-blur-md sticky top-0 z-50 py-4">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6C5DD3] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl text-slate-800 tracking-tight">GradGt.</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="#features" className="hover:text-[#6C5DD3] transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-[#6C5DD3] transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="hover:text-[#6C5DD3] transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-[#6C5DD3] hover:bg-white font-bold rounded-xl px-6">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#6C5DD3] hover:bg-[#5b4eb8] text-white rounded-xl px-6 font-bold shadow-md hover:shadow-lg transition-all">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

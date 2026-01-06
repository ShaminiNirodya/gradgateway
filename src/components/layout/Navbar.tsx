import Link from "next/link";
import { Button } from "@/components/ui/button";

import { GraduationCap, Menu, ChevronRight } from "lucide-react";

export default function Navbar() {
  return (
    // GLASSMORPHISM: bg-white/80 + backdrop-blur
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              Grad<span className="text-violet-600">Gateway</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">Sri Lanka</span>
          </div>
        </Link>

        {/* Desktop Navigation - Pill Hover Effects */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-100">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block">
            <Button variant="ghost" className="text-slate-600 hover:text-violet-700 hover:bg-violet-50 font-medium">
              Log in
            </Button>
          </Link>
          
          <Link href="/register">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-lg shadow-slate-900/20 transition-all hover:shadow-slate-900/40 hover:-translate-y-0.5">
              Get Started <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </Link>

          {/* Mobile Menu Trigger (Visual Only) */}
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// Micro-component for consistent nav links
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-5 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-violet-700 hover:bg-white hover:shadow-sm transition-all duration-200"
    >
      {children}
    </Link>
  );

}

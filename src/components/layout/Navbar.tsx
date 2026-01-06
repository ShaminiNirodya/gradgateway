import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold tracking-tight text-gray-900">
            Grad<span className="text-violet-600">Gateway.lk</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-violet-600 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-violet-600 transition-colors">How It Works</Link>
          <Link href="#pricing" className="hover:text-violet-600 transition-colors">Pricing</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-violet-600 font-semibold">
              Login
            </Button>
          </Link>
          <Link href="/register">
            {/* Using your brand gradient */}
            <Button className="bg-gradient-brand hover:opacity-90 transition-opacity rounded-full px-6 border-0">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

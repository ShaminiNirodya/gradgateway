'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: isHome ? "#features" : "/#features", label: "Features" },
    { href: isHome ? "#how-it-works" : "/#how-it-works", label: "How It Works" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/50 backdrop-blur-xl"
          : "border-transparent bg-white/70 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <GradGatewayLogo
          href="/"
          size={40}
          wordmarkClassName="hidden text-xl font-bold sm:inline"
        />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-[#6C5DD3] group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#6C5DD3] to-indigo-600 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button
              variant="ghost"
              className="font-semibold text-slate-700 transition-all duration-200 hover:bg-indigo-50 hover:text-[#6C5DD3]"
            >
              Log in
            </Button>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button className="rounded-xl bg-[#6C5DD3] font-semibold text-white shadow-lg shadow-[#6C5DD3]/30 transition-all duration-300 hover:bg-[#5b4eb8] hover:shadow-xl hover:shadow-[#6C5DD3]/35">
              Sign Up
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-slate-700" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white">
          <div className="container mx-auto px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-indigo-50 hover:text-[#6C5DD3]"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start font-semibold text-slate-700 hover:bg-indigo-50 hover:text-[#6C5DD3]"
              >
                Log in
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full rounded-xl bg-[#6C5DD3] font-semibold text-white hover:bg-[#5b4eb8]">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}

    </nav>
  );
}

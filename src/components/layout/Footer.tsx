import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white pt-20 pb-10 relative overflow-hidden">
      
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16 relative z-10">
          
          {/* Brand Column (Wider) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              GradGateway.lk
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              We are Sri Lanka's leading platform connecting ambitious undergraduates with top-tier industry opportunities. Verified skills, real projects, zero barriers.
            </p>
            
            {/* Newsletter Input (New UX Addition) */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-white mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2 max-w-xs">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <Button size="icon" className="bg-violet-600 hover:bg-violet-700 rounded-lg">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><FooterLink href="/about">About Us</FooterLink></li>
              <li><FooterLink href="/contact">Contact</FooterLink></li>
              <li><FooterLink href="/careers">Careers</FooterLink></li>
              <li><FooterLink href="/partners">Partners</FooterLink></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><FooterLink href="/blog">Success Stories</FooterLink></li>
              <li><FooterLink href="/help">Help Center</FooterLink></li>
              <li><FooterLink href="/faq">FAQ</FooterLink></li>
              <li><FooterLink href="/guides">Student Guides</FooterLink></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/cookies">Cookie Policy</FooterLink></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-sm text-slate-500">© 2026 GradGateway.lk. All rights reserved.</p>
          
          {/* Social Icons with Hover Rings */}
          <div className="flex gap-4">
            <SocialIcon icon={<Facebook className="w-4 h-4" />} />
            <SocialIcon icon={<Twitter className="w-4 h-4" />} />
            <SocialIcon icon={<Linkedin className="w-4 h-4" />} />
            <SocialIcon icon={<Instagram className="w-4 h-4" />} />
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper for hover effects
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-violet-400 transition-colors duration-200 block">
      {children}
    </Link>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all duration-300 cursor-pointer shadow-md hover:shadow-violet-500/25 hover:-translate-y-1">
      {icon}
    </div>
  );
}

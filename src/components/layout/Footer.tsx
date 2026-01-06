import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              GradGateway.lk
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting Sri Lankan undergraduate talent with industry opportunities through verified portfolios and direct communication.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 GradGateway.lk. All rights reserved.</p>
          <div className="flex gap-4">
            <Facebook className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
            <Twitter className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
            <Linkedin className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
            <Instagram className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        <div className="bg-white rounded-[24px] p-8 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">🔒</div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Reset Password</h1>
          <p className="text-sm text-slate-500 mb-6">Enter your email to receive a reset link.</p>
          <Input placeholder="you@email.com" className="h-12 mb-4" />
          <Button className="w-full rounded-xl">Send Reset Link</Button>
          <p className="text-xs text-slate-400 mt-3">Remembered password? <Link href="/login" className="text-[#6C5DD3] font-bold">Login</Link></p>
        </div>
        <div className="rounded-[24px] p-8 text-white shadow-sm bg-gradient-to-br from-[#5b4eb8] via-[#6C5DD3] to-[#8a7cff]">
          <h2 className="text-lg font-bold mb-4">Security Tips</h2>
          <ul className="space-y-2 text-sm text-indigo-100">
            <li>• Use a unique password for each account</li>
            <li>• Choose passwords with at least 8 characters</li>
            <li>• Include numbers, symbols, and mixed-case letters</li>
            <li>• Never share your password with anyone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

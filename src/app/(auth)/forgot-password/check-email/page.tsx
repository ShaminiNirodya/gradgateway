import Link from "next/link";

export default function ForgotPasswordCheckEmailPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] p-8 shadow-sm w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">✉️</div>
        <h1 className="text-xl font-bold text-slate-800 mb-1">Check Your Email</h1>
        <p className="text-sm text-slate-500 mb-6">We sent a password reset link to your email address. Please check your inbox (and spam) to follow the instructions.</p>
        <Link href="/login" className="text-[#6C5DD3] font-bold text-sm">Back to Login</Link>
      </div>
    </div>
  );
}

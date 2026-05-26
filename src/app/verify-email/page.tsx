export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] p-8 shadow-sm w-full max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">✉️</div>
        <h1 className="text-xl font-bold text-slate-800 mb-1 text-center">Verify Your Email</h1>
        <p className="text-sm text-slate-500 text-center mb-6">We’ve sent a verification link to <span className="font-bold">user@example.com</span>. Click the link to verify your email. The link will expire in 15 minutes.</p>
        <div className="bg-yellow-50 text-yellow-700 rounded-xl p-3 text-xs">Tip: If you entered the wrong email, try again with a new address.</div>
      </div>
    </div>
  );
}

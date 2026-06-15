import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] p-8 shadow-sm w-full max-w-xl text-center">
        <div className="rounded-[24px] p-6 text-white mb-6 bg-gradient-to-r from-[#6C5DD3] to-[#8a7cff]">
          <h1 className="text-5xl font-extrabold">404</h1>
          <p className="mt-2 font-bold">Page Not Found</p>
        </div>
        <p className="text-sm text-slate-500 mb-4">Oops! The page you're looking for seems to have wandered off. Let's help you find your way back.</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/" className="px-3 py-2 bg-slate-100 rounded-xl text-sm font-bold">Home</Link>
          <Link href="/about" className="px-3 py-2 bg-slate-100 rounded-xl text-sm font-bold">About Us</Link>
          <Link href="/faq" className="px-3 py-2 bg-slate-100 rounded-xl text-sm font-bold">FAQ</Link>
          <Link href="/contact" className="px-3 py-2 bg-slate-100 rounded-xl text-sm font-bold">Contact support</Link>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link href="/" className="px-4 py-3 rounded-xl bg-[#6C5DD3] text-white font-bold">Return to Home</Link>
          <Link href="/contact" className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold">Report a Issue</Link>
        </div>
      </div>
    </div>
  );
}

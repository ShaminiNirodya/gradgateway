import Link from "next/link";
import { GradGatewayLogo } from "@/components/brand/GradGatewayLogo";
import LoginForm from "@/components/features/auth/LoginForm";
import { AdminLoginGuard } from "./AdminLoginGuard";

export const metadata = {
  title: "Admin Sign In | GradGateway",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <AdminLoginGuard>
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-[440px] rounded-[32px] border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <GradGatewayLogo href="/" size={44} showWordmark={false} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Staff sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            Platform administration only. This page is not linked from the public site.
          </p>
        </div>

        <LoginForm role="admin" />

        <p className="mt-8 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Back to GradGateway
          </Link>
        </p>
      </div>
    </div>
    </AdminLoginGuard>
  );
}

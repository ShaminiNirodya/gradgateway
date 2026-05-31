"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Lock, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

type Step = "email" | "code" | "reset";

async function parseApiResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text.trim()) {
    if (response.status === 404) {
      throw new Error(
        "Password reset API not found. Stop and restart the GradGateway API (gradgateway-b), then try again."
      );
    }
    throw new Error(`Server returned an empty response (${response.status}).`);
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Server returned an invalid response. Check that the API is running.");
  }
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address");
      }

      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || data.success === false) {
        throw new Error((data.message as string) || "Failed to send reset code");
      }

      setMessage(
        (data.message as string) ||
          "Reset code sent! Check your email (and spam folder)."
      );
      setStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!code.trim() || code.trim().length < 6) {
        throw new Error("Please enter the 6-digit verification code");
      }

      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_RESET_CODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || !data.valid) {
        throw new Error((data.message as string) || "Invalid verification code");
      }

      setMessage("Code verified! Now create your new password.");
      setStep("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!newPassword.trim()) {
        throw new Error("Please enter a new password");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || data.success === false) {
        throw new Error((data.message as string) || "Failed to reset password");
      }

      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-blue-200/30 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: "1s" }}></div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-indigo-200/30 border border-white/50">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center mb-4 shadow-lg">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-sm text-slate-600 mb-6">
            {step === "email" && "Enter your email to receive a 6-digit reset code."}
            {step === "code" && "Enter the code we sent to your email."}
            {step === "reset" && "Choose a new password for your account."}
          </p>

          {step === "email" && (
            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="pl-12 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all font-medium"
                    disabled={loading}
                  />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
              {message && <SuccessBox message={message} />}
              <Button type="submit" disabled={loading || !email.trim()} className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send Reset Code"}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Remembered your password? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Back to login</Link>
              </p>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Verification Code</label>
                <p className="text-xs text-slate-500 mb-3">Enter the 6-digit code sent to {email}</p>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="pl-12 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all font-mono text-lg tracking-widest"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
              {message && <SuccessBox message={message} />}
              <Button type="submit" disabled={loading || code.length < 6} className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify Code"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setStep("email"); setCode(""); setError(null); setMessage(null); }} className="w-full text-indigo-600 font-semibold">
                Change email
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all font-medium" disabled={loading} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all font-medium" disabled={loading} />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
              {message && <SuccessBox message={message} />}
              <Button type="submit" disabled={loading || !newPassword.trim() || newPassword !== confirmPassword} className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : "Reset Password"}
              </Button>
            </form>
          )}
        </div>

        <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-500/50 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">How it works</h2>
          </div>
          <ul className="space-y-4 text-sm text-indigo-100">
            <li><span className="text-indigo-300 font-bold">1.</span> Enter your email and receive a 6-digit code</li>
            <li><span className="text-indigo-300 font-bold">2.</span> Enter the code to verify your identity</li>
            <li><span className="text-indigo-300 font-bold">3.</span> Set a new password and sign in</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

function SuccessBox({ message }: { message: string }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

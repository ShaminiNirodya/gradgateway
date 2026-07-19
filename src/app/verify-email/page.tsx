"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, sendEmailVerification, type User } from "firebase/auth";
import { CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setVerified(Boolean(current?.emailVerified));
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!auth.currentUser) return;
    setRefreshing(true);
    setNotice(null);
    try {
      await auth.currentUser.reload();
      const isVerified = Boolean(auth.currentUser.emailVerified);
      setVerified(isVerified);
      if (!isVerified) {
        setNotice("Not verified yet. Click the link in the email we sent, then check again.");
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const resend = useCallback(async () => {
    if (!auth.currentUser) return;
    setResending(true);
    setNotice(null);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/verify-email`,
      });
      setNotice("Verification email sent. Check your inbox (and spam folder).");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      setNotice(
        message.includes("too-many-requests")
          ? "Too many requests. Please wait a few minutes before resending."
          : "Could not send the email. Please try again shortly."
      );
    } finally {
      setResending(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-sm text-center">
        {checking ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
        ) : verified ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">Email verified</h1>
            <p className="mt-2 text-sm text-slate-500">
              {user?.email} is verified. You're all set.
            </p>
            <Button asChild className="mt-6 w-full rounded-xl">
              <Link href="/login">Continue to login</Link>
            </Button>
          </>
        ) : user ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <MailCheck className="h-7 w-7 text-indigo-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">Verify your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              We sent a verification link to <span className="font-semibold text-slate-700">{user.email}</span>.
              Click it, then come back here.
            </p>
            {notice && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">{notice}</p>
            )}
            <div className="mt-6 space-y-3">
              <Button className="w-full rounded-xl" onClick={refreshStatus} disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                I've verified — check again
              </Button>
              <Button variant="outline" className="w-full rounded-xl" onClick={resend} disabled={resending}>
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <MailCheck className="h-7 w-7 text-indigo-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">Verify your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              Log in first so we know which account to verify.
            </p>
            <Button asChild className="mt-6 w-full rounded-xl">
              <Link href="/login">Go to login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

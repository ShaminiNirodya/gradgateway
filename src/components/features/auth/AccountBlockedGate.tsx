"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AccountBlockedDialog } from "@/components/features/auth/AccountBlockedDialog";
import {
  ACCOUNT_BLOCKED_MESSAGE,
  isAccountBlockedResponse,
  isBlockedUserData,
} from "@/lib/utils/account-blocked";

type AccountBlockedGateProps = {
  children: ReactNode;
};

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export function AccountBlockedGate({ children }: AccountBlockedGateProps) {
  const pathname = usePathname();
  const { user, userData, accountBlocked, blockedMessage, refreshAccountStatus, signOut } =
    useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const blockedRef = useRef(false);
  const [pulse, setPulse] = useState(false);

  const blocked = accountBlocked || isBlockedUserData(userData);
  blockedRef.current = blocked;

  const triggerPulse = useCallback(() => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 450);
  }, []);

  useEffect(() => {
    if (!user || userData?.role === "Admin") return;
    if (blocked) return;
    void refreshAccountStatus();
  }, [user, userData?.role, pathname, refreshAccountStatus, blocked]);

  useEffect(() => {
    if (!blocked || !user) return;

    const allowInteraction = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      return Boolean(
        dialogRef.current?.contains(target) ||
          (target instanceof Element && target.closest("[data-account-blocked-action]"))
      );
    };

    const onPointerDown = (event: Event) => {
      if (allowInteraction(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      triggerPulse();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (allowInteraction(event.target)) return;
      if (event.key === "Tab" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        triggerPulse();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [blocked, user, triggerPulse]);

  useEffect(() => {
    if (!user || userData?.role === "Admin") return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = requestUrl(args[0]);

      if (url.includes("/api/auth/me") || blockedRef.current) {
        return response;
      }

      if (response.status === 403) {
        const body = await response.clone().json().catch(() => null);
        if (isAccountBlockedResponse(response.status, body)) {
          void refreshAccountStatus(ACCOUNT_BLOCKED_MESSAGE);
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [user, userData?.role, refreshAccountStatus]);

  return (
    <>
      {children}
      {blocked && user ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]">
          <div ref={dialogRef}>
            <AccountBlockedDialog
              email={userData?.email ?? user.email ?? undefined}
              displayName={user.displayName ?? userData?.email}
              role={userData?.role}
              message={blockedMessage}
              pulse={pulse}
              onSignOut={() => void signOut()}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

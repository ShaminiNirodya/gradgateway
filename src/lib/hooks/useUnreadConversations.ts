"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { signalRService } from "@/lib/services/signalr.service";

function isMessagesRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.includes("/messages");
}

export function useUnreadConversationsState() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const onMessagesPage = isMessagesRoute(pathname);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        setUnreadCount(0);
        return;
      }

      DashboardService.clearConversationsCache();
      const conversations = await DashboardService.getMyConversations(token);
      const count = conversations.filter((c) => Boolean(c.hasUnread)).length;
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshUnreadCount();
  }, [pathname, refreshUnreadCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        void refreshUnreadCount();
      }
    }, 12_000);

    const onFocus = () => void refreshUnreadCount();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshUnreadCount();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    const unsubscribeMessage = signalRService.onMessage((newMessage) => {
      const isFromMe =
        Boolean(user?.email) &&
        newMessage?.senderName?.toLowerCase() === user?.email?.toLowerCase();

      if (isFromMe) return;

      DashboardService.clearConversationsCache();
      void refreshUnreadCount();
    });

    const unsubscribeConversation = signalRService.onConversationUpdate(() => {
      DashboardService.clearConversationsCache();
      void refreshUnreadCount();
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConversation();
    };
  }, [refreshUnreadCount, user?.email]);

  const showMessagesBadge = !onMessagesPage && unreadCount > 0;

  return { unreadCount, showMessagesBadge, refreshUnreadCount };
}

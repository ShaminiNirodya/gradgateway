"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { signalRService } from "@/lib/services/signalr.service";
import { NotificationItem } from "@/lib/types/dashboard";
import { DEADLINE_NOTIFICATION_TITLE, normalizeNotification } from "@/lib/utils/notifications";
import { useToast } from "@/components/ui/toast";

export function useNotificationsState() {
  const { show } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const refreshNotifications = useCallback(async () => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        setNotifications([]);
        return;
      }

      const rows = await DashboardService.getMyNotifications(token);
      setNotifications(rows);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );

      try {
        const token = await AuthService.getIdToken();
        if (!token) return;
        await DashboardService.markNotificationRead(token, notificationId);
      } catch {
        void refreshNotifications();
      }
    },
    [refreshNotifications],
  );

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        void refreshNotifications();
      }
    }, 60_000);

    const onFocus = () => void refreshNotifications();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    const unsubscribe = signalRService.onNotification((raw) => {
      const incoming = normalizeNotification(raw as Record<string, unknown>);
      setNotifications((prev) => {
        if (prev.some((n) => n.id === incoming.id)) {
          return prev.map((n) => (n.id === incoming.id ? incoming : n));
        }
        return [incoming, ...prev];
      });

      show({
        title: incoming.title,
        description: incoming.body,
        variant: incoming.title === DEADLINE_NOTIFICATION_TITLE ? "warning" : "default",
      });
    });

    return unsubscribe;
  }, [show]);

  return {
    notifications,
    unreadCount,
    isLoading,
    panelOpen,
    setPanelOpen,
    refreshNotifications,
    markAsRead,
  };
}

/** @deprecated Use useNotificationsState */
export const useCompanyNotificationsState = useNotificationsState;

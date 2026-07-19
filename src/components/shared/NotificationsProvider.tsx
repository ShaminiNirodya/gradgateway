"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useNotificationsState } from "@/lib/hooks/useNotifications";

type NotificationsContextValue = ReturnType<typeof useNotificationsState>;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const value = useNotificationsState();

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}

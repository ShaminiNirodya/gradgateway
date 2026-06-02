"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useUnreadConversationsState } from "@/lib/hooks/useUnreadConversations";

type UnreadConversationsValue = ReturnType<typeof useUnreadConversationsState>;

const UnreadConversationsContext = createContext<UnreadConversationsValue | null>(null);

export function UnreadConversationsProvider({ children }: { children: ReactNode }) {
  const value = useUnreadConversationsState();

  return (
    <UnreadConversationsContext.Provider value={value}>{children}</UnreadConversationsContext.Provider>
  );
}

export function useUnreadConversations(): UnreadConversationsValue {
  const context = useContext(UnreadConversationsContext);
  if (!context) {
    throw new Error("useUnreadConversations must be used within UnreadConversationsProvider");
  }
  return context;
}

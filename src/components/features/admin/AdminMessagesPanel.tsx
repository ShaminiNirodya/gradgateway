"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, RefreshCw, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { AdminService } from "@/lib/services/admin.service";
import { ConversationItem } from "@/lib/types/dashboard";
import { AdminUserListItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { formatChatMessageTime, formatConversationListDate } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils";

type MessageItem = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  sentAt: string;
};

function dedupeConversations(list: ConversationItem[]): ConversationItem[] {
  const byParty = new Map<string, ConversationItem>();

  for (const conversation of list) {
    const key = `${(conversation.supportTargetRole ?? conversation.kind ?? "User").toLowerCase()}::${conversation.otherPartyName.trim().toLowerCase()}`;
    const existing = byParty.get(key);
    if (
      !existing ||
      new Date(conversation.lastMessageAt).getTime() > new Date(existing.lastMessageAt).getTime()
    ) {
      byParty.set(key, conversation);
    }
  }

  return [...byParty.values()].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export function AdminMessagesPanel() {
  const { show } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkHandledRef = useRef<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<AdminUserListItem[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      DashboardService.clearConversationsCache();
      const list = await DashboardService.getMyConversations(token);
      const deduped = dedupeConversations(list);
      setConversations(deduped);
      return deduped;
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load conversations.",
        variant: "error",
      });
      setConversations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [show]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setMessagesLoading(true);
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;
        const rows = await DashboardService.getConversationMessages(token, conversationId, {
          skipCache: true,
        });
        setMessages(rows);
      } catch (e) {
        show({
          title: "Messages failed",
          description: e instanceof Error ? e.message : "Could not load messages.",
          variant: "error",
        });
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [show]
  );

  const startWithProfile = useCallback(
    async (payload: { studentProfileId?: string; companyProfileId?: string }) => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;

        const created = await DashboardService.startConversation(token, payload);
        DashboardService.clearConversationsCache();
        const refreshed = dedupeConversations(await DashboardService.getMyConversations(token));
        setConversations(refreshed);

        const selected =
          refreshed.find((c) => c.id === created.id) ??
          refreshed.find(
            (c) =>
              c.otherPartyName.trim().toLowerCase() === created.otherPartyName.trim().toLowerCase() &&
              (c.supportTargetRole ?? "") === (created.supportTargetRole ?? "")
          ) ??
          created;

        setSelectedId(selected.id);
        await loadMessages(selected.id);
      } catch (e) {
        show({
          title: "Could not start chat",
          description: e instanceof Error ? e.message : "Failed to open conversation.",
          variant: "error",
        });
      }
    },
    [loadMessages, show]
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const studentProfileId = searchParams.get("studentProfileId");
    const companyProfileId = searchParams.get("companyProfileId");

    if (!studentProfileId && !companyProfileId) {
      return;
    }

    const deepLinkKey = studentProfileId
      ? `student:${studentProfileId}`
      : `company:${companyProfileId}`;

    if (deepLinkHandledRef.current === deepLinkKey) {
      return;
    }

    deepLinkHandledRef.current = deepLinkKey;

    void (async () => {
      await startWithProfile({
        studentProfileId: studentProfileId ?? undefined,
        companyProfileId: companyProfileId ?? undefined,
      });
      router.replace("/dashboard/admin/messages", { scroll: false });
    })();
  }, [searchParams, startWithProfile, router]);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (selectedId) {
      void loadMessages(selectedId);
    }
  }, [selectedId, loadMessages]);

  useEffect(() => {
    const query = userSearch.trim();
    if (query.length < 2) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;
        const result = await AdminService.getUsers(token, { search: query, pageSize: 20 });
        const messageable = result.items.filter(
          (u) => u.role === "Student" || u.role === "Company"
        );
        setUserResults(messageable);
      } catch {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch]);

  const sendMessage = async () => {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await DashboardService.sendConversationMessage(token, selectedId, draft.trim());
      setDraft("");
      await loadMessages(selectedId);
      await loadConversations();
    } catch (e) {
      show({
        title: "Send failed",
        description: e instanceof Error ? e.message : "Could not send message.",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const openUserConversation = async (user: AdminUserListItem) => {
    if (user.role === "Student" && user.studentProfileId) {
      await startWithProfile({ studentProfileId: user.studentProfileId });
    } else if (user.role === "Company" && user.companyProfileId) {
      await startWithProfile({ companyProfileId: user.companyProfileId });
    } else {
      show({
        title: "Cannot message user",
        description: "This account does not have a student or company profile.",
        variant: "error",
      });
    }
    setUserSearch("");
    setUserResults([]);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={MessageSquare}
        title="Messages"
        subtitle="Message any student or company account. All admins share the same support threads."
      >
        <Button
          variant="secondary"
          className="rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
          onClick={() => void loadConversations()}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </AdminPageHeader>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-700">Start a conversation</label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search students or companies by name or email…"
            className="rounded-xl pl-10"
          />
        </div>
        {searchingUsers && (
          <p className="mt-2 text-xs text-slate-500">Searching users…</p>
        )}
        {userResults.length > 0 && (
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {userResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => void openUserConversation(user)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-800">
                  {user.displayName ?? user.email}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid min-h-[520px] gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
            Conversations
          </div>
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No conversations yet. Search a user above.</p>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50",
                    selectedId === conversation.id && "bg-indigo-50/70"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.otherPartyPhotoUrl ?? undefined} />
                    <AvatarFallback>
                      {conversation.otherPartyName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {conversation.otherPartyName}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatConversationListDate(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6C5DD3]">
                      {conversation.supportTargetRole ?? "User"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                    {conversation.hasUnread && (
                      <span className="mt-1 inline-block rounded-full bg-[#6C5DD3] px-2 py-0.5 text-[10px] font-bold text-white">
                        New
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedConversation ? (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="font-bold text-slate-900">{selectedConversation.otherPartyName}</p>
                <p className="text-xs text-slate-500">
                  {selectedConversation.supportTargetRole ?? "User"} support thread
                </p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messagesLoading ? (
                  <p className="text-sm text-slate-500">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500">No messages yet. Say hello.</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-700">{message.senderName}</p>
                        <p className="text-[10px] text-slate-400">
                          {formatChatMessageTime(message.sentAt)}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 p-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder="Write a message…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm focus:border-[#6C5DD3]/40 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
                    disabled={sending || !draft.trim()}
                    onClick={() => void sendMessage()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
              Select a conversation or search for a user to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

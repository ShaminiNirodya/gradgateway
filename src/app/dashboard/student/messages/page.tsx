"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Phone, Video, MoreVertical, X, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ConversationItem } from "@/lib/types/dashboard";
import { useAuth } from "@/lib/contexts/AuthContext";
import { signalRService } from "@/lib/services/signalr.service";
import { UnreadMessageIndicator } from "@/components/shared/UnreadMessageIndicator";

type MessageItem = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  sentAt: string;
};

type OfferMessagePayload = {
  position: string;
  jobType: string;
  compensation?: string | null;
  message: string;
  note?: string;
};

type InterviewInvitation = {
  role: string;
  company: string;
  date: string;
  duration: string;
  format: string;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
};

function parseInterviewInvitation(content: string): InterviewInvitation | null {
  if (!content || !content.startsWith('INTERVIEW_INVITATION::')) return null;

  try {
    const jsonData = content.slice('INTERVIEW_INVITATION::'.length);
    const parsed = JSON.parse(jsonData) as InterviewInvitation;
    if (parsed?.role && parsed?.company && parsed?.date) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function parseOfferMessage(content: string): OfferMessagePayload | null {
  if (!content) return null;

  if (content.startsWith("JOB_OFFER::")) {
    const raw = content.slice("JOB_OFFER::".length);
    try {
      const parsed = JSON.parse(raw) as OfferMessagePayload;
      if (parsed?.position && parsed?.jobType && parsed?.message) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Backward compatibility for older plain-text offer format.
  if (content.startsWith("JOB OFFER")) {
    const compact = content.replace(/\s+/g, " ").trim();

    const positionMatch = compact.match(/Position:\s*(.*?)\s+Type:/i);
    const typeMatch = compact.match(/Type:\s*(.*?)\s+(Compensation:|Please reply|$)/i);
    const compensationMatch = compact.match(/Compensation:\s*(.*?)\s+Please reply/i);

    const position = positionMatch?.[1]?.trim();
    const jobType = typeMatch?.[1]?.trim();

    if (!position || !jobType) {
      // If legacy message cannot be parsed, keep it as a normal message (no fake values).
      return null;
    }

    const messageBody = compact
      .replace(/^JOB OFFER(?: PROPOSAL)?\s*/i, "")
      .replace(/Position:\s*.*?\s+Type:\s*.*?(\s+Compensation:\s*.*?\s+Please reply|\s+Please reply|$)/i, "")
      .trim();

    return {
      position,
      jobType,
      compensation: compensationMatch?.[1]?.trim() || null,
      message: messageBody || compact,
      note: "Please reply in this chat if you are interested.",
    };
  }

  return null;
}

function conversationPreviewText(raw: string): string {
  const interview = parseInterviewInvitation(raw);
  if (interview) return `Interview Invitation: ${interview.role}`;
  
  const offer = parseOfferMessage(raw);
  if (offer) return `Job Offer: ${offer.position}`;
  
  return raw;
}

function sortConversationsForInbox(list: ConversationItem[]): ConversationItem[] {
  return [...list].sort((a, b) => {
    const aUnread = Boolean(a.hasUnread);
    const bUnread = Boolean(b.hasUnread);
    if (aUnread !== bUnread) return aUnread ? -1 : 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
}

function conversationShowsUnread(conversation: ConversationItem): boolean {
  return Boolean(conversation.hasUnread);
}

function findScrollTargetMessageId(
  messages: MessageItem[],
  userEmail?: string | null
): string | null {
  if (messages.length === 0) return null;

  const isIncoming = (message: MessageItem) =>
    Boolean(userEmail) &&
    message.senderName?.toLowerCase() !== userEmail.toLowerCase();

  const firstUnreadIncoming = messages.find((m) => isIncoming(m) && !m.isRead);
  if (firstUnreadIncoming) return firstUnreadIncoming.id;

  const lastIncoming = [...messages].reverse().find(isIncoming);
  if (lastIncoming) return lastIncoming.id;

  return messages[messages.length - 1]?.id ?? null;
}

export default function StudentMessagesPage() {
  const { show } = useToast();
  const { user, userData } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const isCompany = userData?.role === "Company";
  const selectedConversationIdRef = useRef<string | null>(null);
  const lastActiveRefreshAtRef = useRef<number>(0);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const scrollToMessageConversationIdRef = useRef<string | null>(null);
  const conversationIdParam = searchParams.get("conversationId");
  const opportunityIdParam = searchParams.get("opportunityId");
  const studentProfileIdParam = searchParams.get("studentProfileId");

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Generate unique meeting ID based on conversation
  const generateMeetingId = useCallback((conversationId: string | null) => {
    if (!conversationId) return null;
    return `gradgateway-${conversationId.substring(0, 8)}`;
  }, []);

  // Generate Google Meet URL
  const getMeetingUrl = useCallback((conversationId: string | null) => {
    if (!conversationId) return null;
    const meetingId = generateMeetingId(conversationId);
    return `https://meet.google.com/${meetingId}`;
  }, [generateMeetingId]);

  // Handle video call button click
  const handleVideoCall = useCallback(() => {
    if (!isCompany) {
      show({ title: "Not available", description: "Only companies can start a video call", variant: "error" });
      return;
    }
    if (!selectedConversationId) {
      show({ title: "No conversation selected", description: "Select a conversation first.", variant: "error" });
      return;
    }
    setVideoCallActive(true);
    setShowVideoModal(true);
  }, [selectedConversationId, isCompany, show]);

  // Copy meeting link to clipboard
  const copyMeetingLink = useCallback(async () => {
    const meetUrl = getMeetingUrl(selectedConversationId);
    if (!meetUrl) return;

    try {
      await navigator.clipboard.writeText(meetUrl);
      show({ title: "Copied", description: "Meeting link copied to clipboard", variant: "success" });
    } catch {
      show({ title: "Error", description: "Failed to copy link", variant: "error" });
    }
  }, [selectedConversationId, getMeetingUrl, show]);

  const loadConversations = useCallback(async () => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        setConversations([]);
        setSelectedConversationId(null);
        return;
      }

      const rows = await DashboardService.getMyConversations(token);

      let selected = null;
      let finalRows = rows;

      // Priority 1: Direct conversation ID from params
      if (conversationIdParam) {
        selected = rows.find((c) => c.id === conversationIdParam) || null;
      }

      // Priority 2: Opportunity ID from params (try to find or create)
      if (!selected && opportunityIdParam) {
        selected = rows.find((c) => c.opportunityId === opportunityIdParam) || null;

        // If no conversation exists for this opportunity, create it
        if (!selected) {
          try {
            const created = await DashboardService.startConversation(token, { opportunityId: opportunityIdParam });
            finalRows = [created, ...rows.filter((c) => c.id !== created.id)];
            selected = created;
          } catch {
            // Keep empty state if conversation cannot be created for this opportunity.
          }
        }
      }

      // Priority 3: Student profile ID from params (company talent -> message)
      if (!selected && studentProfileIdParam) {
        try {
          const created = await DashboardService.startConversation(token, { studentProfileId: studentProfileIdParam });
          finalRows = [created, ...rows.filter((c) => c.id !== created.id)];
          selected = created;
        } catch {
          // Keep empty state if conversation cannot be created for this student.
        }
      }

      // Keep the active chat only while still on this page (no auto-open of first chat).
      if (
        !selected &&
        !conversationIdParam &&
        !opportunityIdParam &&
        !studentProfileIdParam &&
        selectedConversationIdRef.current
      ) {
        selected = rows.find((c) => c.id === selectedConversationIdRef.current) || null;
      }

      setConversations(finalRows);
      if (selected?.hasUnread) {
        scrollToMessageConversationIdRef.current = selected.id;
      }
      setSelectedConversationId(selected?.id || null);
    } catch {
      setConversations([]);
      setSelectedConversationId(null);
    }
  }, [conversationIdParam, opportunityIdParam, studentProfileIdParam]);

  const loadMessages = useCallback(async (conversationId: string, silent = false) => {
    try {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      if (!silent) {
        setLoadingMessages(true);
      }

      const token = await AuthService.getIdToken();
      if (!token) {
        setMessages([]);
        return;
      }

      const rows = await DashboardService.getConversationMessages(token, conversationId);
      setMessages(rows);
      void loadConversations();
    } catch {
      if (!silent) {
        setMessages([]);
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }, [loadConversations]);

  useEffect(() => {
    signalRService.start();

    const unsubscribe = signalRService.onMessage((newMessage: MessageItem) => {
      const isActiveChat = selectedConversationIdRef.current === newMessage.conversationId;
      const isFromMe =
        Boolean(user?.email) &&
        newMessage.senderName?.toLowerCase() === user.email?.toLowerCase();

      if (isActiveChat) {
        setMessages((prev) => [...prev, newMessage]);
        if (!isFromMe) {
          scrollToMessageConversationIdRef.current = newMessage.conversationId;
        }
        void loadMessages(newMessage.conversationId, true);
      }

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === newMessage.conversationId);
        if (!exists) {
          void loadConversations();
          return prev;
        }

        const updated = prev.map((c) =>
          c.id === newMessage.conversationId
            ? {
                ...c,
                lastMessage: newMessage.content,
                lastMessageAt: newMessage.sentAt,
                hasUnread: !isFromMe && !isActiveChat,
              }
            : c
        );
        return sortConversationsForInbox(updated);
      });

      DashboardService.clearConversationsCache();
      void loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [loadConversations, loadMessages, user?.email]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  useEffect(() => {
    const shouldPoll = () => typeof document === "undefined" || document.visibilityState === "visible";

    const conversationInterval = setInterval(() => {
      if (!shouldPoll()) return;
      loadConversations();
    }, 15000);

    return () => clearInterval(conversationInterval);
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const shouldPoll = () => typeof document === "undefined" || document.visibilityState === "visible";

    const messageInterval = setInterval(() => {
      if (!shouldPoll()) return;
      loadMessages(selectedConversationId, true);
    }, 8000);

    return () => clearInterval(messageInterval);
  }, [selectedConversationId, loadMessages]);

  useEffect(() => {
    const handleActiveRefresh = () => {
      const now = Date.now();
      if (now - lastActiveRefreshAtRef.current < 1000) {
        return;
      }
      lastActiveRefreshAtRef.current = now;

      loadConversations();
      if (selectedConversationId) {
        loadMessages(selectedConversationId, true);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleActiveRefresh();
      }
    };

    window.addEventListener("focus", handleActiveRefresh);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleActiveRefresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadConversations, loadMessages, selectedConversationId]);

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations;
    const term = query.toLowerCase();
    return conversations.filter(
      (conversation) =>
        conversation.otherPartyName.toLowerCase().includes(term) ||
        conversation.lastMessage.toLowerCase().includes(term)
    );
  }, [conversations, query]);

  const sortedConversations = useMemo(
    () => sortConversationsForInbox(filteredConversations),
    [filteredConversations]
  );

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation?.hasUnread) {
        scrollToMessageConversationIdRef.current = conversationId;
      }
      setSelectedConversationId(conversationId);
    },
    [conversations]
  );

  const scrollToTargetMessage = useCallback(() => {
    const targetConversationId = scrollToMessageConversationIdRef.current;
    if (!targetConversationId || targetConversationId !== selectedConversationId) return;

    const container = messagesScrollRef.current;
    if (!container || loadingMessages || messages.length === 0) return;

    const targetMessageId = findScrollTargetMessageId(messages, user?.email);
    if (!targetMessageId) {
      scrollToMessageConversationIdRef.current = null;
      return;
    }

    requestAnimationFrame(() => {
      const element = container.querySelector(`[data-message-id="${targetMessageId}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      scrollToMessageConversationIdRef.current = null;
    });
  }, [selectedConversationId, loadingMessages, messages, user?.email]);

  useEffect(() => {
    scrollToTargetMessage();
  }, [scrollToTargetMessage]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const sendConversationReply = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !selectedConversationId) return;

      const token = await AuthService.getIdToken();
      if (!token) throw new Error("Please log in again.");

      const sent = await DashboardService.sendConversationMessage(token, selectedConversationId, trimmed);
      setMessages((prev) => [...prev, sent]);
      await loadConversations();
      show({ title: "Message sent", description: "Your message has been delivered", variant: "success" });
      return sent;
    },
    [selectedConversationId, loadConversations, show]
  );

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !selectedConversationId) return;

    try {
      await sendConversationReply(content);
      setInput("");
    } catch (error: any) {
      show({ title: "Send failed", description: error?.message || "Unable to send message.", variant: "error" });
    }
  };

  const meetingUrl = getMeetingUrl(selectedConversationId);
  const openMeeting = () => {
    if (!meetingUrl) return;
    window.open(meetingUrl, "_blank");
  };

  return (
    <div className="-m-4 flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 flex-col gap-4 overflow-hidden p-4 lg:-m-8 lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] lg:grid lg:grid-cols-3 lg:gap-8 lg:p-8">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-sm lg:col-span-1 lg:max-h-full">
        <Input
          placeholder="Search conversations..."
          className="mb-4 h-10 shrink-0 rounded-xl"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
          {sortedConversations.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No conversations yet</p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {isCompany
                  ? "Message candidates from Talent Search or Applications."
                  : "Apply to openings or message companies to start a chat."}
              </p>
            </div>
          )}
          {sortedConversations.map((conversation) => {
            const isUnread = conversationShowsUnread(conversation);
            return (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedConversationId === conversation.id
                ? "bg-indigo-50 border border-indigo-100"
                : isUnread
                  ? "bg-emerald-50/40 border border-emerald-100/80 hover:bg-emerald-50/60"
                  : "bg-white border border-transparent hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                    {conversation.otherPartyPhotoUrl && <AvatarImage src={conversation.otherPartyPhotoUrl} alt={conversation.otherPartyName} />}
                    <AvatarFallback>{conversation.otherPartyName[0]}</AvatarFallback>
                  </Avatar>
                  {isUnread && (
                    <UnreadMessageIndicator className="absolute -top-0.5 -right-0.5" ringClassName="ring-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${isUnread ? "font-extrabold text-slate-900" : "font-bold text-slate-800"}`}>
                    {conversation.otherPartyName}
                  </p>
                  <p className={`text-xs truncate ${isUnread ? "font-medium text-slate-600" : "text-slate-400"}`}>
                    {conversationPreviewText(conversation.lastMessage) || "No messages yet"}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-medium shrink-0 ${isUnread ? "text-emerald-600" : "text-slate-400"}`}>
                {new Date(conversation.lastMessageAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" })}
              </span>
            </div>
            );
          })}
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-slate-50 bg-white shadow-sm lg:col-span-2">
        {!selectedConversation ? (
          <MessagesEmptyPanel
            isCompany={isCompany}
            unreadCount={sortedConversations.filter((c) => Boolean(c.hasUnread)).length}
            hasConversations={sortedConversations.length > 0}
          />
        ) : (
          <>
            <div className="z-10 flex shrink-0 items-center justify-between rounded-t-[24px] border-b bg-white/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                  {selectedConversation.otherPartyPhotoUrl && <AvatarImage src={selectedConversation.otherPartyPhotoUrl} alt={selectedConversation.otherPartyName} />}
                  <AvatarFallback>{selectedConversation.otherPartyName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-800">{selectedConversation.otherPartyName}</p>
                  <p className="text-xs text-slate-500 font-medium">Conversation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={handleVideoCall}
                  title={isCompany ? "Start video call" : "Only companies can start calls"}
                  disabled={!isCompany}
                >
                  <Video className={`w-4 h-4 ${isCompany ? "text-slate-500 hover:text-indigo-600" : "text-slate-300"}`} />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled><Phone className="w-4 h-4 text-slate-300" /></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4 text-slate-500" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-slate-100">
                    <DropdownMenuItem className="rounded-lg">Mute Notifications</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">Archive Conversation</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div
              ref={messagesScrollRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50/30 p-6"
            >
              {loadingMessages ? (
                <div className="text-sm text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-slate-400">No messages yet. Start the conversation.</div>
              ) : (
                messages.map((message) => {
                  const fromMe = message.senderName === user?.email;
                  const interview = parseInterviewInvitation(message.content);
                  const offer = parseOfferMessage(message.content);

                  if (interview) {
                    return (
                      <div key={message.id} data-message-id={message.id} className={`flex ${fromMe ? "justify-end" : "justify-start"} mb-6`}>
                        <div className={`max-w-[600px] w-full ${fromMe ? "bg-gradient-to-br from-[#6C5DD3] to-[#8a7cff] text-white" : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200"} rounded-2xl overflow-hidden shadow-md`}>
                          {/* Header */}
                          <div className={`${fromMe ? "bg-white/10" : "bg-white/80"} px-6 py-4 border-b ${fromMe ? "border-white/20" : "border-indigo-200"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${fromMe ? "bg-white/20" : "bg-indigo-100"}`}>
                                <svg className={`w-6 h-6 ${fromMe ? "text-white" : "text-[#6C5DD3]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className={`font-bold text-lg ${fromMe ? "text-white" : "text-slate-800"}`}>Interview Invitation</h3>
                                <p className={`text-sm font-medium ${fromMe ? "text-indigo-100" : "text-indigo-600"}`}>{interview.company}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="px-6 py-5 space-y-4">
                            <div className={`${fromMe ? "bg-white/5" : "bg-white/60"} rounded-xl p-4 space-y-3`}>
                              <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
                                <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Role:</span>
                                <span className={`text-sm font-semibold ${fromMe ? "text-white" : "text-slate-900"}`}>{interview.role}</span>
                              </div>
                              
                              <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Company:</span>
                                <span className={`text-sm ${fromMe ? "text-white" : "text-slate-800"}`}>{interview.company}</span>
                              </div>
                              
                              <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Proposed Date:</span>
                                <span className={`text-sm ${fromMe ? "text-white" : "text-slate-800"}`}>{interview.date}</span>
                              </div>
                              
                              <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Approx. Duration:</span>
                                <span className={`text-sm ${fromMe ? "text-white" : "text-slate-800"}`}>{interview.duration}</span>
                              </div>
                              
                              <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Format:</span>
                                <span className={`text-sm ${fromMe ? "text-white" : "text-slate-800"}`}>{interview.format}</span>
                              </div>
                              
                              {interview.meetingLink && (
                                <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                  <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Meeting Link:</span>
                                  <a 
                                    href={interview.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                      fromMe 
                                        ? "bg-white/20 hover:bg-white/30 text-white" 
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    {interview.meetingLink.length > 40 ? interview.meetingLink.substring(0, 40) + '...' : interview.meetingLink}
                                  </a>
                                </div>
                              )}
                              
                              {interview.location && (
                                <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                  <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Location:</span>
                                  <span className={`text-sm ${fromMe ? "text-white" : "text-slate-800"}`}>{interview.location}</span>
                                </div>
                              )}
                              
                              {interview.notes && (
                                <div className={`border-t ${fromMe ? "border-white/10" : "border-indigo-100"} pt-3 grid grid-cols-[120px_1fr] gap-3 items-start`}>
                                  <span className={`text-sm font-semibold ${fromMe ? "text-indigo-200" : "text-slate-600"}`}>Note:</span>
                                  <span className={`text-sm ${fromMe ? "text-white" : "text-slate-800"}`}>{interview.notes}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Footer Note */}
                            <div className={`${fromMe ? "bg-white/5" : "bg-amber-50/80"} rounded-lg px-4 py-3 border-l-4 ${fromMe ? "border-white/30" : "border-amber-400"}`}>
                              <p className={`text-xs ${fromMe ? "text-indigo-100" : "text-amber-800"}`}>
                                <span className="font-semibold">Note:</span> We'll follow up in this chat to confirm your interview time — it may differ per candidate.
                              </p>
                            </div>
                          </div>
                          
                          {/* Timestamp */}
                          <div className={`px-6 pb-4 text-xs ${fromMe ? "text-indigo-200" : "text-slate-500"}`}>
                            {new Date(message.sentAt).toLocaleString("en-LK", { 
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: "2-digit", 
                              minute: "2-digit"
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (offer) {
                    return (
                      <div key={message.id} data-message-id={message.id}>
                        <OfferMessage
                          from={fromMe ? "me" : "them"}
                          offer={offer}
                          showActions={!isCompany && !fromMe}
                          onRespond={sendConversationReply}
                        />
                      </div>
                    );
                  }

                  const isNewIncoming = !fromMe && !message.isRead;

                  return (
                    <div
                      key={message.id}
                      data-message-id={message.id}
                      className={isNewIncoming ? "rounded-2xl ring-2 ring-emerald-300/80 ring-offset-2" : undefined}
                    >
                      <Message from={fromMe ? "me" : "them"}>{message.content}</Message>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-b-[24px] border-t bg-white p-4">
              <Button variant="ghost" size="icon-sm"><Paperclip className="w-4 h-4 text-slate-400" /></Button>
              <Input
                placeholder="Type your message..."
                className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-100"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!input.trim()}>Send</Button>
            </div>
          </>
        )}
      </main>

      {/* Video Call Modal */}
      {showVideoModal && selectedConversationId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800">Video Interview with {selectedConversation?.otherPartyName}</h2>
              <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {videoCallActive ? (
                <>
                  <div className="bg-slate-100 rounded-lg p-8 text-center space-y-4">
                    <div className="text-sm text-slate-600">
                      <p className="font-semibold mb-2">Meeting Link:</p>
                      <div className="bg-white rounded-lg p-3 flex items-center justify-between gap-2">
                        <code className="text-xs text-slate-700 truncate">{meetingUrl}</code>
                        <button
                          onClick={copyMeetingLink}
                          className="text-indigo-600 hover:text-indigo-700 p-1"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600">
                      {isCompany
                        ? "Your meeting link has been generated. Share it with the candidate or join directly."
                        : "You can now join the meeting using the link above."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      asChild
                      className="flex-1"
                      onClick={openMeeting}
                    >
                      <a href={meetingUrl || "#"} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Join Meeting Now
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyMeetingLink}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setVideoCallActive(false);
                      setShowVideoModal(false);
                    }}
                  >
                    Close
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-slate-600">Ready to start a video interview?</p>
                  <Button
                    onClick={() => setVideoCallActive(true)}
                    className="w-full"
                  >
                    <Video className="w-4 h-4 mr-2" /> Start Interview
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesEmptyPanel({
  isCompany,
  unreadCount,
  hasConversations,
}: {
  isCompany: boolean;
  unreadCount: number;
  hasConversations: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-br from-slate-50/90 via-white to-indigo-50/30">
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg space-y-8 text-center">
          <div className="relative mx-auto w-fit">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#6C5DD3] to-[#8a7cff] shadow-xl shadow-indigo-200/60">
              <MessageSquare className="h-11 w-11 text-white" strokeWidth={1.75} />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-bold text-white shadow-md ring-4 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {unreadCount > 0 ? "You have new messages" : "Choose a conversation"}
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
              {isCompany
                ? "Pick a chat from the list to reply to candidates, share offers, or schedule interviews."
                : "Pick a chat from the list to follow up with companies about roles and interviews."}
            </p>
          </div>

          <div className="grid gap-3 text-left sm:grid-cols-3">
            {[
              isCompany ? "Review candidate replies" : "Track application updates",
              isCompany ? "Send job offers in chat" : "Respond to interview invites",
              "Keep everything in one thread",
            ].map((tip) => (
              <div
                key={tip}
                className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-xs font-medium text-slate-600 shadow-sm"
              >
                {tip}
              </div>
            ))}
          </div>

          {!hasConversations && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-8">
              <p className="text-sm font-semibold text-slate-700">No chats yet</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {isCompany
                  ? "Start messaging from Talent Search or Applications — conversations will show up on the left."
                  : "Message a company from Openings or Applications — your chats will appear on the left."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Message({ children, from }: { children: ReactNode; from: "me" | "them" }) {
  const isMe = from === "me";
  return (
    <div className={`max-w-xl rounded-2xl px-5 py-4 text-sm font-medium ${isMe ? "bg-[#6C5DD3] text-white ml-auto shadow-lg shadow-indigo-100 rounded-br-none" : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-none"}`}>
      {children}
    </div>
  );
}

const OFFER_REPLY_INTERVIEW =
  "I am open for an interview. Please share the available dates and times.";
const OFFER_REPLY_REJECTED =
  "Thank you for the offer. I am not moving forward with this opportunity at this time.";

function OfferMessage({
  from,
  offer,
  showActions,
  onRespond,
}: {
  from: "me" | "them";
  offer: OfferMessagePayload;
  showActions: boolean;
  onRespond: (text: string) => Promise<unknown>;
}) {
  const isMe = from === "me";
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleQuickReply = async (text: string) => {
    setSubmitting(true);
    try {
      await onRespond(text);
      setReplyMode(false);
      setReplyText("");
    } catch {
      // Parent shows toast on failure
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomReply = async () => {
    if (!replyText.trim()) return;
    await handleQuickReply(replyText.trim());
  };

  return (
    <div
      className={`max-w-xl rounded-2xl px-5 py-4 ${isMe ? "bg-indigo-600 text-white ml-auto shadow-lg shadow-indigo-100 rounded-br-none" : "bg-amber-50 text-slate-800 border border-amber-200 shadow-sm rounded-bl-none"}`}
    >
      <div className="text-[11px] font-extrabold uppercase tracking-wide opacity-90 mb-2">Job Offer</div>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-bold">Position:</span> {offer.position}
        </p>
        <p>
          <span className="font-bold">Type:</span> {offer.jobType}
        </p>
        {offer.compensation ? (
          <p>
            <span className="font-bold">Compensation:</span> {offer.compensation}
          </p>
        ) : null}
      </div>
      <p className={`text-sm mt-3 whitespace-pre-wrap ${isMe ? "text-indigo-50" : "text-slate-700"}`}>{offer.message}</p>
      {offer.note ? <p className={`text-xs mt-3 ${isMe ? "text-indigo-100" : "text-slate-500"}`}>{offer.note}</p> : null}

      {showActions ? (
        <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-3">
          {!replyMode ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                onClick={() => handleQuickReply(OFFER_REPLY_INTERVIEW)}
              >
                Open for an interview
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={submitting}
                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 text-xs h-9"
                onClick={() => handleQuickReply(OFFER_REPLY_REJECTED)}
              >
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={submitting}
                className="rounded-lg border-amber-300 text-slate-700 hover:bg-amber-100 text-xs h-9"
                onClick={() => setReplyMode(true)}
              >
                Reply
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                disabled={submitting}
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting || !replyText.trim()}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
                  onClick={handleCustomReply}
                >
                  {submitting ? "Sending..." : "Send reply"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={submitting}
                  className="rounded-lg text-xs h-9 text-slate-600"
                  onClick={() => {
                    setReplyMode(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Phone, Video, MoreVertical, X, Copy, ExternalLink } from "lucide-react";
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
  if (content.startsWith("JOB OFFER PROPOSAL")) {
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
      .replace(/^JOB OFFER PROPOSAL\s*/i, "")
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
  const offer = parseOfferMessage(raw);
  if (!offer) return raw;
  return `Job Offer: ${offer.position}`;
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

      // Priority 4: Use previously selected conversation only if no params provided
      if (!selected && !conversationIdParam && !opportunityIdParam && !studentProfileIdParam && selectedConversationIdRef.current) {
        selected = rows.find((c) => c.id === selectedConversationIdRef.current) || null;
      }

      // Priority 5: Default to first conversation
      if (!selected && finalRows.length > 0) {
        selected = finalRows[0];
      }

      setConversations(finalRows);
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
    } catch {
      if (!silent) {
        setMessages([]);
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }, []);

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

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !selectedConversationId) return;

    try {
      const token = await AuthService.getIdToken();
      if (!token) throw new Error("Please log in again.");

      const sent = await DashboardService.sendConversationMessage(token, selectedConversationId, content);
      setMessages((prev) => [...prev, sent]);
      setInput("");
      await loadConversations();
      show({ title: "Message sent", description: "Your message has been delivered", variant: "success" });
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
      <aside className="bg-white rounded-[24px] p-6 shadow-sm lg:col-span-1 flex flex-col">
        <Input
          placeholder="Search conversations..."
          className="h-10 mb-4 rounded-xl"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversationId(conversation.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedConversationId === conversation.id
                ? "bg-indigo-50 border border-indigo-100"
                : "bg-white border border-transparent hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.otherPartyName}`} />
                  <AvatarFallback>{conversation.otherPartyName[0]}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{conversation.otherPartyName}</p>
                  <p className="text-xs text-slate-400 truncate">{conversationPreviewText(conversation.lastMessage) || "No messages yet"}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                {new Date(conversation.lastMessageAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <main className="bg-white rounded-[24px] shadow-sm lg:col-span-2 flex flex-col border border-slate-50">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select a conversation</div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b bg-white/50 backdrop-blur-sm rounded-t-[24px] z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherPartyName}`} />
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

            <div className="flex-1 overflow-y-auto space-y-4 p-6 bg-slate-50/30">
              {loadingMessages ? (
                <div className="text-sm text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-slate-400">No messages yet. Start the conversation.</div>
              ) : (
                messages.map((message) => {
                  const fromMe = message.senderName === user?.email;
                  const offer = parseOfferMessage(message.content);

                  if (offer) {
                    return <OfferMessage key={message.id} from={fromMe ? "me" : "them"} offer={offer} />;
                  }

                  return <Message key={message.id} from={fromMe ? "me" : "them"}>{message.content}</Message>;
                })
              )}
            </div>

            <div className="border-t p-4 flex items-center gap-2 bg-white rounded-b-[24px]">
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

function Message({ children, from }: { children: ReactNode; from: "me" | "them" }) {
  const isMe = from === "me";
  return (
    <div className={`max-w-xl rounded-2xl px-5 py-4 text-sm font-medium ${isMe ? "bg-[#6C5DD3] text-white ml-auto shadow-lg shadow-indigo-100 rounded-br-none" : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-none"}`}>
      {children}
    </div>
  );
}

function OfferMessage({ from, offer }: { from: "me" | "them"; offer: OfferMessagePayload }) {
  const isMe = from === "me";

  return (
    <div className={`max-w-xl rounded-2xl px-5 py-4 ${isMe ? "bg-indigo-600 text-white ml-auto shadow-lg shadow-indigo-100 rounded-br-none" : "bg-amber-50 text-slate-800 border border-amber-200 shadow-sm rounded-bl-none"}`}>
      <div className="text-[11px] font-extrabold uppercase tracking-wide opacity-90 mb-2">Job Offer</div>
      <div className="space-y-1 text-sm">
        <p><span className="font-bold">Position:</span> {offer.position}</p>
        <p><span className="font-bold">Type:</span> {offer.jobType}</p>
        {offer.compensation ? <p><span className="font-bold">Compensation:</span> {offer.compensation}</p> : null}
      </div>
      <p className={`text-sm mt-3 whitespace-pre-wrap ${isMe ? "text-indigo-50" : "text-slate-700"}`}>{offer.message}</p>
      {offer.note ? <p className={`text-xs mt-3 ${isMe ? "text-indigo-100" : "text-slate-500"}`}>{offer.note}</p> : null}
    </div>
  );
}

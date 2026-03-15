"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search, Send, Image, FileText, Check, CheckCheck,
  Circle, Inbox as InboxIcon, Paperclip, X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useSocket } from "@/lib/socket";
import { getInitials, formatRelativeTime, formatDateTime, cn } from "@/lib/utils";
import { Button, Input } from "@/components/shared";
import toast from "react-hot-toast";

interface Conversation {
  id: string; status: string; unread_count: number;
  last_message_at: string | null; wa_contact_name: string | null;
  lead: { id: string; name: string; phone: string; status: string };
  messages: { content: { text?: string }; direction: string }[];
}
interface Message {
  id: string; direction: string; type: string;
  content: Record<string, unknown>;
  status: string; created_at: string;
}

export default function InboxPage() {
  const socket = useSocket();
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const fetchConversations = useCallback(async () => {
    const res = await api.get<{ data: Conversation[] }>("/api/inbox/conversations?limit=50");
    setConversations(res.data);
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await api.get<{ data: Message[] }>(
        `/api/inbox/conversations/${convId}/messages?limit=50`
      );
      setMessages(res.data.reverse());
    } finally { setLoadingMsgs(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket: real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", (data: { message: Message; conversation_id: string; lead?: { name: string; phone: string } }) => {
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversation_id
            ? { ...c, unread_count: c.unread_count + 1, last_message_at: new Date().toISOString() }
            : c
        )
      );
      // Append to active conversation
      if (activeConv?.id === data.conversation_id) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    socket.on("message:status", (data: { wa_message_id: string; status: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          (m.content as { wa_message_id?: string })?.wa_message_id === data.wa_message_id
            ? { ...m, status: data.status }
            : m
        )
      );
    });

    return () => {
      socket.off("message:new");
      socket.off("message:status");
    };
  }, [socket, activeConv]);

  const openConversation = (conv: Conversation) => {
    setActiveConv(conv);
    fetchMessages(conv.id);
    socket?.emit("join:conversation", conv.id);
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
    );
  };

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    const msg = text.trim();
    setText("");
    setSending(true);

    // Optimistic message
    const optimistic: Message = {
      id: `opt-${Date.now()}`, direction: "OUTBOUND", type: "TEXT",
      content: { text: msg }, status: "SENT",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.post(`/api/inbox/conversations/${activeConv.id}/reply`, { text: msg });
    } catch (e) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally { setSending(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.upload<{ data: { wa_media_id?: string; s3_url: string } }>(
        "/api/storage/upload", fd
      );
      toast.success("File sent");
    } catch {
      toast.error("File upload failed");
    }
    e.target.value = "";
  };

  const filteredConvs = conversations.filter((c) =>
    c.lead.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lead.phone.includes(search)
  );

  const getLastMsg = (conv: Conversation) => {
    const last = conv.messages?.[0];
    if (!last) return "No messages";
    const content = last.content as { text?: string };
    return content.text ?? (last.direction === "OUTBOUND" ? "You sent a message" : "Sent a file");
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: conversation list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations…" className="pl-8 h-7 text-xs"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No conversations</div>
          ) : filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className={cn(
                "w-full flex items-start gap-3 p-3 text-left hover:bg-accent/50 transition-colors border-b border-border/50",
                activeConv?.id === conv.id && "bg-accent"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {getInitials(conv.lead.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{conv.lead.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                    {formatRelativeTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{getLastMsg(conv)}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat panel */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
              {getInitials(activeConv.lead.name)}
            </div>
            <div>
              <p className="text-sm font-medium">{activeConv.lead.name}</p>
              <p className="text-xs font-mono text-muted-foreground">{activeConv.lead.phone}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => api.patch(`/api/inbox/conversations/${activeConv.id}/status`, { status: "RESOLVED" })
                  .then(() => { toast.success("Resolved"); fetchConversations(); })}
                className="text-xs px-3 py-1 rounded-md border border-border hover:bg-accent transition-colors text-muted-foreground"
              >
                Resolve
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingMsgs ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.map((msg) => {
              const isOut = msg.direction === "OUTBOUND";
              const content = msg.content as { text?: string };
              return (
                <div key={msg.id} className={cn("flex", isOut ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-xs lg:max-w-md px-3 py-2 rounded-xl text-sm",
                    isOut
                      ? "bg-primary/20 text-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  )}>
                    <p className="leading-relaxed">{content.text ?? "[Media]"}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(msg.created_at).split(",")[1]?.trim()}
                      </span>
                      {isOut && (
                        msg.status === "READ" ? <CheckCheck size={11} className="text-primary" />
                        : msg.status === "DELIVERED" ? <CheckCheck size={11} className="text-muted-foreground" />
                        : <Check size={11} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-border">
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors shrink-0"
              >
                <Paperclip size={15} />
              </button>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={handleFileUpload} />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring max-h-32"
                style={{ overflowY: text.includes("\n") ? "auto" : "hidden" }}
              />
              <Button size="sm" loading={sending} onClick={handleSend} className="shrink-0">
                <Send size={13} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <InboxIcon size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pick a conversation from the left to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

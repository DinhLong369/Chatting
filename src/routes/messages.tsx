import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Phone, Search, Send, Smile, Video, Paperclip } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Tin nhắn — Glow" },
      { name: "description", content: "Trò chuyện với bạn bè trên Glow." },
      { property: "og:title", content: "Tin nhắn — Glow" },
      { property: "og:description", content: "Trò chuyện với bạn bè trên Glow." },
    ],
  }),
  component: MessagesPage,
});

type Conversation = {
  id: string;
  name: string;
  initial: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
};

const conversations: Conversation[] = [
  { id: "1", name: "Minh Anh", initial: "M", preview: "Tối nay đi xem hoàng hôn không? 🌅", time: "2 phút", unread: 2, online: true },
  { id: "2", name: "Hà Linh", initial: "H", preview: "Gửi mình file thiết kế nhé!", time: "15 phút", online: true },
  { id: "3", name: "Nhóm K15", initial: "K", preview: "Quân: ok mai gặp nhé cả nhà", time: "1 giờ", unread: 5 },
  { id: "4", name: "Tuấn Kiệt", initial: "T", preview: "Cảm ơn bạn nhiều 🙏", time: "3 giờ" },
  { id: "5", name: "Phương Thảo", initial: "P", preview: "Bạn đã thả tim ảnh", time: "Hôm qua" },
  { id: "6", name: "Đức Anh", initial: "Đ", preview: "Để mình kiểm tra lại nhé", time: "Hôm qua" },
];

type Msg = { id: string; from: "me" | "them"; text: string; time: string };

const initialThread: Msg[] = [
  { id: "m1", from: "them", text: "Tối nay đi xem hoàng hôn không? 🌅", time: "17:02" },
  { id: "m2", from: "me", text: "Đi chứ! Hẹn 6h ở bờ hồ nhé.", time: "17:03" },
  { id: "m3", from: "them", text: "Deal 🤝 nhớ mang máy ảnh nha", time: "17:03" },
  { id: "m4", from: "me", text: "Ok luôn, mình mới mua ống kính mới đó.", time: "17:05" },
  { id: "m5", from: "them", text: "Wow ghen tị ghê 😆", time: "17:06" },
];

function MessagesPage() {
  const [activeId, setActiveId] = useState("1");
  const [thread, setThread] = useState<Msg[]>(initialThread);
  const [draft, setDraft] = useState("");
  const active = conversations.find((c) => c.id === activeId)!;

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setThread((t) => [
      ...t,
      {
        id: `m${t.length + 1}`,
        from: "me",
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div
          className="grid h-[calc(100vh-7rem)] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[320px_1fr]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {/* Sidebar */}
          <aside className="flex flex-col border-r border-border">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold">Tin nhắn</h2>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Tìm kiếm cuộc trò chuyện"
                  className="h-10 w-full rounded-full bg-secondary pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                      isActive ? "bg-accent" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="relative">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                        style={{ background: "var(--gradient-warm)" }}
                      >
                        {c.initial}
                      </div>
                      {c.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{c.name}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">{c.preview}</span>
                        {c.unread && (
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
                            style={{ background: "var(--gradient-warm)" }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Thread */}
          <section className="flex min-h-0 flex-col">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  {active.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold">{active.name}</div>
                  <div className="text-xs text-primary">
                    {active.online ? "đang hoạt động" : "ngoại tuyến"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="rounded-full p-2 hover:bg-accent hover:text-foreground">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="rounded-full p-2 hover:bg-accent hover:text-foreground">
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
              <div className="text-center text-[11px] uppercase tracking-wider text-muted-foreground">
                Hôm nay
              </div>
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === "me"
                        ? "rounded-tr-md text-primary-foreground"
                        : "rounded-tl-md bg-muted text-foreground"
                    }`}
                    style={
                      m.from === "me" ? { background: "var(--gradient-warm)" } : undefined
                    }
                  >
                    {m.text}
                    <div
                      className={`mt-1 text-[10px] ${
                        m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="border-t border-border p-4">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
                <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập tin nhắn…"
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
import { Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-warm)" }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Glow</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/messages"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Tin nhắn
          </Link>
          <Link
            to="/login"
            className="rounded-full px-4 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-warm)" }}
          >
            Đăng ký
          </Link>
        </nav>
      </div>
    </header>
  );
}
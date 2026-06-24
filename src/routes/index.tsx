import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glow — Mạng xã hội kết nối những điều ấm áp" },
      { name: "description", content: "Glow là mạng xã hội nơi bạn chia sẻ khoảnh khắc, nhắn tin và kết nối với những người bạn quan tâm." },
      { property: "og:title", content: "Glow — Mạng xã hội kết nối những điều ấm áp" },
      { property: "og:description", content: "Chia sẻ khoảnh khắc, nhắn tin và kết nối với những người bạn quan tâm." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <AppHeader />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Một nơi ấm áp <br /> để{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-warm)" }}
              >
                kết nối
              </span>
              .
            </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Glow là mạng xã hội nhỏ xinh dành cho những cuộc trò chuyện thật, những bức ảnh thật và những người bạn thật.
            </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-warm)" }}
              >
                Tạo tài khoản <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/messages"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Xem tin nhắn
              </Link>
            </div>
      </main>
    </div>
  );
}

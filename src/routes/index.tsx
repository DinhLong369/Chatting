import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ArrowRight, Heart, MessageCircle, Users } from "lucide-react";

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
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Đang mở thử nghiệm
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
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
            <div className="mt-8 flex flex-wrap gap-3">
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

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-6">
              {[
                { icon: Users, label: "Bạn bè", value: "12k+" },
                { icon: MessageCircle, label: "Tin nhắn / ngày", value: "98k" },
                { icon: Heart, label: "Khoảnh khắc", value: "4.2k" },
              ].map((s) => (
                <div key={s.label}>
                  <s.icon className="h-4 w-4 text-primary" />
                  <div className="mt-2 text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat preview card */}
          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-40 blur-3xl"
              style={{ background: "var(--gradient-warm)" }}
            />
            <div
              className="rounded-3xl border border-border bg-card p-5"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  M
                </div>
                <div>
                  <div className="text-sm font-semibold">Minh Anh</div>
                  <div className="text-xs text-primary">đang hoạt động</div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-foreground">
                  Tối nay đi xem hoàng hôn không? 🌅
                </div>
                <div
                  className="ml-auto max-w-[75%] rounded-2xl rounded-tr-md px-4 py-2.5 text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  Đi chứ! Hẹn 6h ở bờ hồ nhé.
                </div>
                <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-foreground">
                  Deal 🤝
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                Nhập tin nhắn…
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

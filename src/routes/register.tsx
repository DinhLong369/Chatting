import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { AuthShell, PrimaryButton } from "@/components/AuthShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Đăng ký — Glow" },
      { name: "description", content: "Tạo tài khoản Glow để bắt đầu kết nối và trò chuyện." },
      { property: "og:title", content: "Đăng ký — Glow" },
      { property: "og:description", content: "Tạo tài khoản Glow để bắt đầu kết nối và trò chuyện." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const titles = {
    1: { t: "Đăng ký với email", s: "Chúng tôi sẽ gửi mã xác thực 6 số đến email của bạn." },
    2: { t: "Nhập mã xác thực", s: `Mã đã được gửi tới ${email || "email của bạn"}.` },
    3: { t: "Hoàn tất hồ sơ", s: "Chọn tên người dùng và mật khẩu để hoàn tất." },
  } as const;

  const current = done
    ? { t: "Tạo tài khoản thành công", s: "Chào mừng bạn đến với Glow!" }
    : titles[step];

  return (
    <AuthShell
      title={current.t}
      subtitle={current.s}
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      {!done && <StepIndicator step={step} />}

      {done ? (
        <SuccessPanel />
      ) : step === 1 ? (
        <EmailStep
          email={email}
          setEmail={setEmail}
          onNext={() => setStep(2)}
        />
      ) : step === 2 ? (
        <OtpStep
          otp={otp}
          setOtp={setOtp}
          email={email}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : (
        <ProfileStep
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          onBack={() => setStep(2)}
          onSubmit={() => setDone(true)}
        />
      )}
    </AuthShell>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Email", Icon: Mail },
    { n: 2, label: "Xác thực", Icon: ShieldCheck },
    { n: 3, label: "Hồ sơ", Icon: UserPlus },
  ];
  return (
    <ol className="mb-6 flex items-center gap-2">
      {items.map(({ n, label, Icon }, i) => {
        const active = step === n;
        const done = step > n;
        return (
          <li key={n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                done
                  ? "border-transparent bg-primary text-primary-foreground"
                  : active
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span
              className={`hidden text-xs font-medium sm:inline ${
                active || done ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < items.length - 1 && (
              <span className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function EmailStep({
  email,
  setEmail,
  onNext,
}: {
  email: string;
  setEmail: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) onNext();
      }}
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@email.com"
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
        <p className="text-xs text-muted-foreground">
          Bạn sẽ nhận được mã 6 số trong vài giây.
        </p>
      </div>
      <PrimaryButton>Gửi mã xác thực</PrimaryButton>
    </form>
  );
}

function OtpStep({
  otp,
  setOtp,
  email,
  onBack,
  onNext,
}: {
  otp: string[];
  setOtp: (v: string[]) => void;
  email: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const complete = useMemo(() => otp.every((d) => d !== ""), [otp]);

  const update = (i: number, val: string) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = ch;
    setOtp(next);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
    setOtp(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete) onNext();
      }}
    >
      <div className="flex justify-between gap-2">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            maxLength={1}
            className="h-14 w-12 rounded-xl border border-border bg-card text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Không nhận được mã?</span>
        <button type="button" className="font-medium text-primary hover:underline">
          Gửi lại
        </button>
      </div>

      <PrimaryButton>Xác thực</PrimaryButton>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Đổi email khác ({email || "—"})
      </button>
    </form>
  );
}

function ProfileStep({
  username,
  setUsername,
  password,
  setPassword,
  onBack,
  onSubmit,
}: {
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (username && password.length >= 8) onSubmit();
      }}
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tên người dùng</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="nguyenvana"
          autoComplete="username"
          required
          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border" />
        <span>
          Tôi đồng ý với{" "}
          <a href="#" className="text-primary hover:underline">Điều khoản</a> và{" "}
          <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.
        </span>
      </label>
      <PrimaryButton>Hoàn tất đăng ký</PrimaryButton>
      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Quay lại
      </button>
    </form>
  );
}

function SuccessPanel() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <p className="text-sm text-muted-foreground">
        Tài khoản của bạn đã sẵn sàng. Bắt đầu kết nối với mọi người ngay nào.
      </p>
      <Link
        to="/messages"
        className="inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-primary-foreground shadow-md"
        style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-warm)" }}
      >
        Vào trò chuyện
      </Link>
    </div>
  );
}
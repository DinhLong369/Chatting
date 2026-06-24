import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex"
        style={{ background: "var(--gradient-warm)" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Glow</span>
        </Link>
        <div>
          <p className="text-3xl font-medium leading-snug">
            "Mỗi tin nhắn là một sợi nắng — giữ ấm một mối quan hệ."
          </p>
          <p className="mt-4 text-sm opacity-80">— Đội ngũ Glow</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-8 rounded-full bg-white" />
          <span className="h-1.5 w-3 rounded-full bg-white/40" />
          <span className="h-1.5 w-3 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col" style={{ background: "var(--gradient-soft)" }}>
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-warm)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Glow</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-sm font-medium text-foreground">{children}</label>;
}

export function TextField({
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
      />
    </div>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-11 w-full rounded-xl text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
      style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-warm)" }}
    >
      {children}
    </button>
  );
}

export function SocialButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="h-11 flex-1 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-accent"
    >
      {children}
    </button>
  );
}
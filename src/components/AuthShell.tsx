import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

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

type ValidatedFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  error?: string | null;
  success?: boolean;
  hint?: string;
  rightSlot?: ReactNode;
};

export function ValidatedField({
  label,
  error,
  success,
  hint,
  rightSlot,
  id,
  ...inputProps
}: ValidatedFieldProps) {
  const fid = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const state = error ? "error" : success ? "success" : "idle";
  const ringClass =
    state === "error"
      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
      : state === "success"
      ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20"
      : "border-border focus:border-primary focus:ring-primary/15";

  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          id={fid}
          aria-invalid={!!error}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          {...inputProps}
          className={`h-11 w-full rounded-xl border bg-card px-4 ${
            rightSlot || state !== "idle" ? "pr-10" : ""
          } text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:ring-4 ${ringClass}`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {state === "error" ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : state === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            rightSlot
          )}
        </div>
      </div>
      <FieldMessage id={fid} error={error} hint={hint} />
    </div>
  );
}

export function FieldMessage({
  id,
  error,
  hint,
}: {
  id?: string;
  error?: string | null;
  hint?: string;
}) {
  const showError = !!error;
  return (
    <div
      className={`grid overflow-hidden transition-all duration-200 ease-out ${
        showError ? "grid-rows-[1fr] opacity-100" : hint ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="min-h-0">
        {showError ? (
          <p
            id={`${id}-err`}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// Backward-compat: keep TextField export but route through ValidatedField
export function TextField(props: ValidatedFieldProps) {
  return <ValidatedField {...props} />;
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
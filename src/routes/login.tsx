import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthShell,
  PrimaryButton,
  SocialButton,
  ValidatedField,
} from "@/components/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Glow" },
      { name: "description", content: "Đăng nhập vào Glow để tiếp tục trò chuyện và kết nối." },
      { property: "og:title", content: "Đăng nhập — Glow" },
      { property: "og:description", content: "Đăng nhập vào Glow để tiếp tục trò chuyện và kết nối." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const emailError =
    touched.email && !email
      ? "Vui lòng nhập email."
      : touched.email && !/^\S+@\S+\.\S+$/.test(email)
      ? "Email không hợp lệ. Ví dụ: ban@email.com"
      : null;
  const passwordError =
    touched.password && !password
      ? "Vui lòng nhập mật khẩu."
      : touched.password && password.length < 8
      ? "Mật khẩu cần tối thiểu 8 ký tự."
      : null;

  return (
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục những cuộc trò chuyện của bạn."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({ email: true, password: true });
        }}
      >
        <ValidatedField
          label="Email"
          type="email"
          placeholder="ban@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          success={!emailError && /^\S+@\S+\.\S+$/.test(email)}
        />
        <div>
          <ValidatedField
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordError}
          />
          <div className="mt-2 text-right">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Quên mật khẩu?
            </a>
          </div>
        </div>
        <PrimaryButton>Đăng nhập</PrimaryButton>

        <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          hoặc tiếp tục với
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-3">
          <SocialButton>Google</SocialButton>
          <SocialButton>Apple</SocialButton>
        </div>
      </form>
    </AuthShell>
  );
}
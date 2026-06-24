import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AuthShell,
  PrimaryButton,
  SocialButton,
  TextField,
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
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <TextField label="Email" type="email" placeholder="ban@email.com" autoComplete="email" />
        <div>
          <TextField label="Mật khẩu" type="password" placeholder="••••••••" autoComplete="current-password" />
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
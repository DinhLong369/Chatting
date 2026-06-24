import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AuthShell,
  PrimaryButton,
  SocialButton,
  TextField,
} from "@/components/AuthShell";

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
  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Tham gia Glow trong chưa đầy một phút."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <TextField label="Tên hiển thị" placeholder="Nguyễn Văn A" autoComplete="name" />
        <TextField label="Email" type="email" placeholder="ban@email.com" autoComplete="email" />
        <TextField label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border accent-[oklch(0.65_0.21_35)]" />
          <span>
            Tôi đồng ý với{" "}
            <a href="#" className="text-primary hover:underline">Điều khoản</a> và{" "}
            <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a> của Glow.
          </span>
        </label>
        <PrimaryButton>Tạo tài khoản</PrimaryButton>

        <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          hoặc đăng ký với
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
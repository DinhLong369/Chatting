<script setup lang="ts">
useSeoMeta({
  title: 'Đăng nhập — Glow',
  description: 'Đăng nhập vào Glow để tiếp tục trò chuyện và kết nối.',
  ogTitle: 'Đăng nhập — Glow',
  ogDescription: 'Đăng nhập vào Glow để tiếp tục trò chuyện và kết nối.',
})

const email = ref('')
const password = ref('')
const emailTouched = ref(false)
const passwordTouched = ref(false)

const emailError = computed(() => {
  if (!emailTouched.value) return null
  if (!email.value) return 'Vui lòng nhập email.'
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return 'Email không hợp lệ. Ví dụ: ban@email.com'
  return null
})

const passwordError = computed(() => {
  if (!passwordTouched.value) return null
  if (!password.value) return 'Vui lòng nhập mật khẩu.'
  if (password.value.length < 8) return 'Mật khẩu cần tối thiểu 8 ký tự.'
  return null
})

function handleSubmit() {
  emailTouched.value = true
  passwordTouched.value = true
}
</script>

<template>
  <AuthShell
    title="Chào mừng trở lại"
    subtitle="Đăng nhập để tiếp tục những cuộc trò chuyện của bạn."
  >
    <form novalidate class="space-y-4" @submit.prevent="handleSubmit">
      <UiValidatedField
        v-model="email"
        label="Email"
        type="email"
        placeholder="ban@email.com"
        autocomplete="email"
        :error="emailError"
        :success="!emailError && /^\S+@\S+\.\S+$/.test(email)"
        @blur="emailTouched = true"
      />
      <div>
        <UiValidatedField
          v-model="password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          :error="passwordError"
          @blur="passwordTouched = true"
        />
        <div class="mt-2 text-right">
          <a href="#" class="text-xs text-muted-foreground hover:text-primary">Quên mật khẩu?</a>
        </div>
      </div>
      <UiPrimaryButton>Đăng nhập</UiPrimaryButton>

      <div class="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
        <span class="h-px flex-1 bg-border" />
        hoặc tiếp tục với
        <span class="h-px flex-1 bg-border" />
      </div>
      <div class="flex gap-3">
        <UiSocialButton>Google</UiSocialButton>
        <UiSocialButton>Apple</UiSocialButton>
      </div>
    </form>

    <template #footer>
      Chưa có tài khoản?
      <NuxtLink to="/register" class="font-medium text-primary hover:underline">
        Đăng ký ngay
      </NuxtLink>
    </template>
  </AuthShell>
</template>

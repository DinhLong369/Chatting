<script setup lang="ts">
useSeoMeta({
  title: 'Đăng nhập — Logea',
  description: 'Đăng nhập vào Logea để tiếp tục trò chuyện và kết nối.',
  ogTitle: 'Đăng nhập — Logea',
  ogDescription: 'Đăng nhập vào Logea để tiếp tục trò chuyện và kết nối.',
})

const { init, login } = useAuth()

onMounted(() => {
  init()
})

const account = ref('')
const password = ref('')
const accountTouched = ref(false)
const passwordTouched = ref(false)
const serverError = ref('')
const loading = ref(false)

const accountError = computed(() => {
  if (!accountTouched.value) return null
  if (!account.value.trim()) return 'Vui lòng nhập email hoặc tên đăng nhập.'
  return null
})

const passwordError = computed(() => {
  if (!passwordTouched.value) return null
  if (!password.value) return 'Vui lòng nhập mật khẩu.'
  if (password.value.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự.'
  return null
})

async function handleSubmit() {
  accountTouched.value = true
  passwordTouched.value = true
  serverError.value = ''

  if (accountError.value || passwordError.value) return

  loading.value = true
  const result = await login(account.value.trim(), password.value)
  loading.value = false

  if (result.ok) {
    navigateTo('/messages')
  } else {
    serverError.value = result.message || 'Đăng nhập thất bại'
  }
}
</script>

<template>
  <AuthShell
    title="Chào mừng trở lại"
    subtitle="Đăng nhập để tiếp tục những cuộc trò chuyện của bạn."
  >
    <form novalidate class="space-y-4" @submit.prevent="handleSubmit">
      <div
        v-if="serverError"
        class="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-base text-destructive"
      >
        {{ serverError }}
      </div>

      <UiValidatedField
        v-model="account"
        label="Email hoặc tên đăng nhập"
        type="text"
        placeholder="xxx@gmail.com"
        autocomplete="username"
        :error="accountError"
        :success="!accountError && accountTouched && !!account.trim()"
        @blur="accountTouched = true"
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
          <a href="#" class="text-sm text-muted-foreground hover:text-primary">Quên mật khẩu?</a>
        </div>
      </div>

      <UiPrimaryButton :disabled="loading">
        {{ loading ? 'Đang đăng nhập…' : 'Đăng nhập' }}
      </UiPrimaryButton>

      <div class="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
        <span class="h-px flex-1 bg-border" />
        hoặc tiếp tục với
        <span class="h-px flex-1 bg-border" />
      </div>
      <div class="flex gap-3">
        <UiSocialButton>Google</UiSocialButton>
        <!-- <UiSocialButton>Apple</UiSocialButton> -->
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

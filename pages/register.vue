<script setup lang="ts">
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, ShieldCheck, UserPlus } from 'lucide-vue-next'

useSeoMeta({
  title: 'Đăng ký — Logea',
  description: 'Tạo tài khoản Logea để bắt đầu kết nối và trò chuyện.',
  ogTitle: 'Đăng ký — Logea',
  ogDescription: 'Tạo tài khoản Logea để bắt đầu kết nối và trò chuyện.',
})

const { sendRegisterOtp, verifyRegisterOtp, register } = useAuth()

const step = ref<1 | 2 | 3>(1)
const email = ref('')
const otp = ref(['', '', '', '', '', ''])
const username = ref('')
const displayName = ref('')
const password = ref('')
const done = ref(false)
const loading = ref(false)
const serverError = ref('')
const registerToken = ref('')

const current = computed(() => {
  if (done.value) return { t: 'Tạo tài khoản thành công', s: 'Chào mừng bạn đến với Logea!' }
  const titles = {
    1: { t: 'Đăng ký với email', s: 'Chúng tôi sẽ gửi mã xác thực 6 số đến email của bạn.' },
    2: { t: 'Nhập mã xác thực', s: `Mã đã được gửi tới ${email.value || 'email của bạn'}.` },
    3: { t: 'Hoàn tất hồ sơ', s: 'Chọn tên người dùng, tên hiển thị và mật khẩu để hoàn tất.' },
  }
  return titles[step.value]
})

const steps = [
  { n: 1, label: 'Email' },
  { n: 2, label: 'Xác thực' },
  { n: 3, label: 'Hồ sơ' },
]

// ── Step 1: Email ──
const emailTouched = ref(false)
const emailValid = computed(() => /^\S+@\S+\.\S+$/.test(email.value))
const emailError = computed(() => {
  if (!emailTouched.value) return null
  if (!email.value) return 'Vui lòng nhập email của bạn.'
  if (!emailValid.value) return 'Email không hợp lệ. Ví dụ: xxx@gmail.com'
  return null
})
async function submitEmail() {
  emailTouched.value = true
  if (!emailValid.value) return
  serverError.value = ''
  loading.value = true
  const res = await sendRegisterOtp(email.value.trim())
  loading.value = false
  if (res.ok) step.value = 2
  else serverError.value = res.message || 'Gửi mã thất bại'
}

// ── Step 2: OTP ──
const otpRefs = ref<HTMLInputElement[]>([])
const otpTouched = ref(false)
const otpComplete = computed(() => otp.value.every(d => d !== ''))
const otpError = computed(() => (otpTouched.value && !otpComplete.value ? 'Vui lòng nhập đủ 6 chữ số.' : null))

function updateOtp(i: number, val: string) {
  const ch = val.replace(/\D/g, '').slice(-1)
  otp.value[i] = ch
  if (ch && i < 5) otpRefs.value[i + 1]?.focus()
}
function onOtpKey(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otp.value[i] && i > 0) otpRefs.value[i - 1]?.focus()
}
function onOtpPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  if (!text) return
  e.preventDefault()
  const next = [...otp.value]
  for (let i = 0; i < 6; i++) next[i] = text[i] ?? ''
  otp.value = next
  otpRefs.value[Math.min(text.length, 5)]?.focus()
}
async function submitOtp() {
  otpTouched.value = true
  if (!otpComplete.value) return
  serverError.value = ''
  loading.value = true
  const res = await verifyRegisterOtp(email.value.trim(), otp.value.join(''))
  loading.value = false
  if (res.ok && res.token) {
    registerToken.value = res.token
    step.value = 3
  } else {
    serverError.value = res.message || 'Mã xác thực không đúng'
  }
}

async function resendOtp() {
  serverError.value = ''
  loading.value = true
  const res = await sendRegisterOtp(email.value.trim())
  loading.value = false
  if (!res.ok) serverError.value = res.message || 'Gửi lại mã thất bại'
}

// ── Step 3: Profile ──
const usernameTouched = ref(false)
const passwordTouched = ref(false)
const agreedTouched = ref(false)
const agreed = ref(false)

const usernameValid = computed(() => /^[a-z0-9_.]{3,20}$/i.test(username.value))
const usernameError = computed(() => {
  if (!usernameTouched.value) return null
  if (!username.value) return 'Vui lòng nhập tên người dùng.'
  if (!usernameValid.value) return 'Dùng 3–20 ký tự: chữ, số, dấu chấm hoặc gạch dưới.'
  return null
})
const passwordError = computed(() => {
  if (!passwordTouched.value) return null
  if (!password.value) return 'Vui lòng nhập mật khẩu.'
  if (password.value.length < 8) return 'Mật khẩu cần tối thiểu 8 ký tự.'
  return null
})
const agreeError = computed(() =>
  agreedTouched.value && !agreed.value ? 'Bạn cần đồng ý với điều khoản.' : null,
)

const strength = computed(() => {
  let s = 0
  if (password.value.length >= 8) s++
  if (/[A-Z]/.test(password.value)) s++
  if (/[0-9]/.test(password.value)) s++
  if (/[^A-Za-z0-9]/.test(password.value)) s++
  return s
})
const strengthLabel = computed(
  () => ['Quá yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][strength.value],
)
const strengthColor = computed(
  () =>
    ['bg-destructive', 'bg-destructive', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][
      strength.value
    ],
)

const displayNameTouched = ref(false)
const displayNameError = computed(() => {
  if (!displayNameTouched.value) return null
  if (!displayName.value.trim()) return 'Vui lòng nhập tên hiển thị.'
  if (displayName.value.trim().length > 100) return 'Tên hiển thị tối đa 100 ký tự.'
  return null
})

async function submitProfile() {
  usernameTouched.value = true
  displayNameTouched.value = true
  passwordTouched.value = true
  agreedTouched.value = true
  if (usernameError.value || displayNameError.value || passwordError.value || !agreed.value
    || !username.value || !displayName.value.trim() || password.value.length < 8) return

  serverError.value = ''
  loading.value = true
  const res = await register({
    username: username.value.trim(),
    name: displayName.value.trim(),
    password: password.value,
    token: registerToken.value,
  })
  loading.value = false
  if (res.ok) done.value = true
  else serverError.value = res.message || 'Đăng ký thất bại'
}
</script>

<template>
  <AuthShell :title="current.t" :subtitle="current.s">
    <!-- Step indicator -->
    <ol v-if="!done" class="mb-6 flex items-center gap-2">
      <li v-for="(item, i) in steps" :key="item.n" class="flex flex-1 items-center gap-2">
        <div
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
            step > item.n
              ? 'border-transparent bg-primary text-primary-foreground'
              : step === item.n
                ? 'border-primary text-primary'
                : 'border-border text-muted-foreground',
          ]"
        >
          <CheckCircle2 v-if="step > item.n" class="h-4 w-4" />
          <Mail v-else-if="item.n === 1" class="h-4 w-4" />
          <ShieldCheck v-else-if="item.n === 2" class="h-4 w-4" />
          <UserPlus v-else class="h-4 w-4" />
        </div>
        <span
          :class="[
            'hidden text-sm font-medium sm:inline',
            step === item.n || step > item.n ? 'text-foreground' : 'text-muted-foreground',
          ]"
        >{{ item.label }}</span>
        <span v-if="i < steps.length - 1" :class="['h-px flex-1', step > item.n ? 'bg-primary' : 'bg-border']" />
      </li>
    </ol>

    <!-- Server error -->
    <div
      v-if="serverError && !done"
      class="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
    >
      <AlertCircle class="h-4 w-4 shrink-0" />
      {{ serverError }}
    </div>

    <!-- Step 1: Email -->
    <form v-if="!done && step === 1" novalidate class="space-y-4" @submit.prevent="submitEmail">
      <UiValidatedField
        v-model="email"
        label="Email"
        type="email"
        placeholder="xxx@gmail.com"
        autocomplete="email"
        :error="emailError"
        :success="!emailError && emailValid"
        :hint="!emailError ? 'Bạn sẽ nhận được mã 6 số trong vài giây.' : undefined"
        @blur="emailTouched = true"
      />
      <UiPrimaryButton :disabled="loading">{{ loading ? 'Đang gửi…' : 'Gửi mã xác thực' }}</UiPrimaryButton>
    </form>

    <!-- Step 2: OTP -->
    <form v-else-if="!done && step === 2" novalidate class="space-y-5" @submit.prevent="submitOtp">
      <div>
        <div class="flex justify-between gap-2">
          <input
            v-for="(d, i) in otp"
            :key="i"
            :ref="(el) => { if (el) otpRefs[i] = el as HTMLInputElement }"
            :value="d"
            inputmode="numeric"
            maxlength="1"
            :aria-invalid="!!otpError"
            :class="[
              'h-16 w-14 rounded-xl border bg-card text-center text-xl font-semibold text-foreground outline-none transition-all focus:ring-4',
              otpError
                ? 'border-destructive/60 focus:border-destructive focus:ring-destructive/20'
                : d
                  ? 'border-primary/60 focus:border-primary focus:ring-primary/20'
                  : 'border-border focus:border-primary focus:ring-primary/15',
            ]"
            @input="updateOtp(i, ($event.target as HTMLInputElement).value)"
            @keydown="onOtpKey(i, $event)"
            @paste="onOtpPaste"
          />
        </div>
        <div class="mt-2">
          <p v-if="otpError" role="alert" class="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ otpError }}
          </p>
        </div>
      </div>
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>Không nhận được mã?</span>
        <button type="button" class="font-medium text-primary hover:underline" :disabled="loading" @click="resendOtp">Gửi lại</button>
      </div>
      <UiPrimaryButton :disabled="loading">{{ loading ? 'Đang xác thực…' : 'Xác thực' }}</UiPrimaryButton>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        @click="step = 1; serverError = ''"
      >
        <ArrowLeft class="h-4 w-4" />
        Đổi email khác ({{ email || '—' }})
      </button>
    </form>

    <!-- Step 3: Profile -->
    <form v-else-if="!done && step === 3" novalidate class="space-y-4" @submit.prevent="submitProfile">
      <UiValidatedField
        v-model="username"
        label="Tên người dùng"
        placeholder="nguyenvana"
        autocomplete="username"
        :error="usernameError"
        :success="!usernameError && usernameValid"
        @blur="usernameTouched = true"
      />
      <UiValidatedField
        v-model="displayName"
        label="Tên hiển thị"
        placeholder="Nguyễn Văn A"
        autocomplete="name"
        :error="displayNameError"
        :success="!displayNameError && !!displayName.trim()"
        :hint="!displayNameError ? 'Tên này sẽ hiển thị với mọi người trong đoạn chat.' : undefined"
        @blur="displayNameTouched = true"
      />
      <div class="space-y-1.5">
        <UiValidatedField
          v-model="password"
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          autocomplete="new-password"
          :error="passwordError"
          @blur="passwordTouched = true"
        />
        <div v-if="password && !passwordError" class="space-y-1">
          <div class="flex gap-1">
            <span
              v-for="i in 4"
              :key="i"
              :class="['h-1 flex-1 rounded-full transition-colors', i <= strength ? strengthColor : 'bg-border']"
            />
          </div>
          <p class="text-sm text-muted-foreground">
            Độ mạnh: <span class="font-medium text-foreground">{{ strengthLabel }}</span>
          </p>
        </div>
      </div>
      <div>
        <label :class="['flex items-start gap-2 text-sm', agreeError ? 'text-destructive' : 'text-muted-foreground']">
          <input
            type="checkbox"
            :checked="agreed"
            :class="['mt-0.5 h-5 w-5 rounded', agreeError ? 'border-destructive' : 'border-border']"
            @change="agreed = ($event.target as HTMLInputElement).checked; agreedTouched = true"
          />
          <span>
            Tôi đồng ý với
            <a href="#" class="text-primary hover:underline">Điều khoản</a> và
            <a href="#" class="text-primary hover:underline">Chính sách bảo mật</a>.
          </span>
        </label>
        <p v-if="agreeError" class="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle class="h-4 w-4" />
          {{ agreeError }}
        </p>
      </div>
      <UiPrimaryButton :disabled="loading">{{ loading ? 'Đang đăng ký…' : 'Hoàn tất đăng ký' }}</UiPrimaryButton>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        @click="step = 2; serverError = ''"
      >
        <ArrowLeft class="h-4 w-4" />
        Quay lại
      </button>
    </form>

    <!-- Success -->
    <div v-else class="space-y-4 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 class="h-8 w-8" />
      </div>
      <p class="text-base text-muted-foreground">
        Tài khoản của bạn đã sẵn sàng. Bắt đầu kết nối với mọi người ngay nào.
      </p>
      <NuxtLink
        to="/messages"
        class="inline-flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold text-primary-foreground shadow-md"
        :style="{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-warm)' }"
      >
        Vào trò chuyện
      </NuxtLink>
    </div>

    <template #footer>
      Đã có tài khoản?
      <NuxtLink to="/login" class="font-medium text-primary hover:underline">Đăng nhập</NuxtLink>
    </template>
  </AuthShell>
</template>

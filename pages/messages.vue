<script setup lang="ts">
import { ArrowLeft, Paperclip, Phone, Search, Send, Smile, Video } from 'lucide-vue-next'

useSeoMeta({
  title: 'Tin nhắn — Glow',
  description: 'Trò chuyện với bạn bè trên Glow.',
  ogTitle: 'Tin nhắn — Glow',
  ogDescription: 'Trò chuyện với bạn bè trên Glow.',
})

type Conversation = {
  id: string
  name: string
  initial: string
  preview: string
  time: string
  unread?: number
  online?: boolean
}

const conversations: Conversation[] = [
  { id: '1', name: 'Minh Anh', initial: 'M', preview: 'Tối nay đi xem hoàng hôn không? 🌅', time: '2 phút', unread: 2, online: true },
  { id: '2', name: 'Hà Linh', initial: 'H', preview: 'Gửi mình file thiết kế nhé!', time: '15 phút', online: true },
  { id: '3', name: 'Nhóm K15', initial: 'K', preview: 'Quân: ok mai gặp nhé cả nhà', time: '1 giờ', unread: 5 },
  { id: '4', name: 'Tuấn Kiệt', initial: 'T', preview: 'Cảm ơn bạn nhiều 🙏', time: '3 giờ' },
  { id: '5', name: 'Phương Thảo', initial: 'P', preview: 'Bạn đã thả tim ảnh', time: 'Hôm qua' },
  { id: '6', name: 'Đức Anh', initial: 'Đ', preview: 'Để mình kiểm tra lại nhé', time: 'Hôm qua' },
]

type Msg = { id: string; from: 'me' | 'them'; text: string; time: string }

const thread = ref<Msg[]>([
  { id: 'm1', from: 'them', text: 'Tối nay đi xem hoàng hôn không? 🌅', time: '17:02' },
  { id: 'm2', from: 'me', text: 'Đi chứ! Hẹn 6h ở bờ hồ nhé.', time: '17:03' },
  { id: 'm3', from: 'them', text: 'Deal 🤝 nhớ mang máy ảnh nha', time: '17:03' },
  { id: 'm4', from: 'me', text: 'Ok luôn, mình mới mua ống kính mới đó.', time: '17:05' },
  { id: 'm5', from: 'them', text: 'Wow ghen tị ghê 😆', time: '17:06' },
])

const activeId = ref('1')
const draft = ref('')
const mobileView = ref<'list' | 'thread'>('list')

const active = computed(() => conversations.find(c => c.id === activeId.value)!)

function send() {
  if (!draft.value.trim()) return
  const now = new Date()
  thread.value.push({
    id: `m${thread.value.length + 1}`,
    from: 'me',
    text: draft.value.trim(),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
  draft.value = ''
}
</script>

<template>
  <div class="min-h-screen" :style="{ background: 'var(--gradient-soft)' }">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-0 py-0 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div
        class="grid h-[calc(100dvh-4rem)] grid-cols-1 overflow-hidden border-border bg-card sm:h-[calc(100dvh-6rem)] sm:rounded-3xl sm:border md:h-[calc(100dvh-7rem)] md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]"
        :style="{ boxShadow: 'var(--shadow-soft)' }"
      >
        <!-- Sidebar -->
        <aside
          :class="[
            'min-h-0 flex-col border-border md:flex md:border-r',
            mobileView === 'list' ? 'flex' : 'hidden',
          ]"
        >
          <div class="border-b border-border p-4">
            <h2 class="text-lg font-semibold">Tin nhắn</h2>
            <div class="relative mt-3">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Tìm kiếm cuộc trò chuyện"
                class="h-10 w-full rounded-full bg-secondary pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto p-2">
            <button
              v-for="c in conversations"
              :key="c.id"
              :class="[
                'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors',
                activeId === c.id ? 'bg-accent' : 'hover:bg-secondary',
              ]"
              @click="activeId = c.id; mobileView = 'thread'"
            >
              <div class="relative">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                  :style="{ background: 'var(--gradient-warm)' }"
                >
                  {{ c.initial }}
                </div>
                <span
                  v-if="c.online"
                  class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-sm font-semibold">{{ c.name }}</span>
                  <span class="shrink-0 text-[11px] text-muted-foreground">{{ c.time }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-xs text-muted-foreground">{{ c.preview }}</span>
                  <span
                    v-if="c.unread"
                    class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
                    :style="{ background: 'var(--gradient-warm)' }"
                  >{{ c.unread }}</span>
                </div>
              </div>
            </button>
          </div>
        </aside>

        <!-- Thread -->
        <section
          :class="[
            'min-h-0 flex-col md:flex',
            mobileView === 'thread' ? 'flex' : 'hidden',
          ]"
        >
          <header class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                class="-ml-1 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
                aria-label="Quay lại"
                @click="mobileView = 'list'"
              >
                <ArrowLeft class="h-5 w-5" />
              </button>
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                :style="{ background: 'var(--gradient-warm)' }"
              >
                {{ active.initial }}
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold">{{ active.name }}</div>
                <div class="text-xs text-primary">
                  {{ active.online ? 'đang hoạt động' : 'ngoại tuyến' }}
                </div>
              </div>
            </div>
            <div />
            <div class="flex items-center gap-1 text-muted-foreground">
              <button class="rounded-full p-2 hover:bg-accent hover:text-foreground">
                <Phone class="h-4 w-4" />
              </button>
              <button class="rounded-full p-2 hover:bg-accent hover:text-foreground">
                <Video class="h-4 w-4" />
              </button>
            </div>
          </header>

          <div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div class="text-center text-[11px] uppercase tracking-wider text-muted-foreground">
              Hôm nay
            </div>
            <div
              v-for="m in thread"
              :key="m.id"
              :class="['flex', m.from === 'me' ? 'justify-end' : 'justify-start']"
            >
              <div
                :class="[
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]',
                  m.from === 'me'
                    ? 'rounded-tr-md text-primary-foreground'
                    : 'rounded-tl-md bg-muted text-foreground',
                ]"
                :style="m.from === 'me' ? { background: 'var(--gradient-warm)' } : undefined"
              >
                {{ m.text }}
                <div
                  :class="[
                    'mt-1 text-[10px]',
                    m.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  ]"
                >
                  {{ m.time }}
                </div>
              </div>
            </div>
          </div>

          <form class="border-t border-border p-3 sm:p-4" @submit.prevent="send">
            <div class="flex items-center gap-1.5 rounded-2xl border border-border bg-background px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
              <button type="button" class="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent">
                <Paperclip class="h-4 w-4" />
              </button>
              <input
                v-model="draft"
                placeholder="Nhập tin nhắn…"
                class="min-w-0 flex-1 bg-transparent px-1 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                class="hidden shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent sm:inline-flex"
              >
                <Smile class="h-4 w-4" />
              </button>
              <button
                type="submit"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground"
                :style="{ background: 'var(--gradient-warm)' }"
              >
                <Send class="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

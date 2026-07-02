<script setup lang="ts">
import { ArrowLeft, ImagePlus, LogOut, MessageSquarePlus, MoreHorizontal, Phone, Search, Send, Settings, Trash2, Video, X, Pencil, Check } from 'lucide-vue-next'
import type { Conversation, ChatUser, ChatMessage } from '~/composables/useChat'

useSeoMeta({
  title: 'Tin nhắn — Logea',
  description: 'Trò chuyện với bạn bè trên Logea.',
})

const { init, token, currentUser, logout } = useAuth()
const {
  conversations,
  activeConvId,
  messages,
  latestMessage,
  typingUsers,
  wsConnected,
  connect,
  disconnect,
  loadConversations,
  loadMessages,
  searchUsers,
  createDirectConversation,
  deleteConversation,
  purgeConversation,
  deleteMessage,
  updateMessage,
  sendMessage,
  uploadMedia,
  sendTyping,
  markSeen,
  isOnline,
  getConversationPartner,
  formatLastSeen,
  formatConvTime,
  formatMsgTime,
} = useChat()

// ── Local UI state ──────────────────────────────────────────────────────────
const mobileView = ref<'list' | 'thread'>('list')
const draft = ref('')
const convSearch = ref('')
const newConvSearch = ref('')
const newConvResults = ref<ChatUser[]>([])
const newConvSearching = ref(false)
const showNewConv = ref(false)
const editingMsgId = ref<string | null>(null)
const editContent = ref('')
const openMenuMsgId = ref<string | null>(null)
const showSettingsMenu = ref(false)
const openConvMenuId = ref<string | null>(null)
const pendingPurgeConvId = ref<string | null>(null)
const messageListRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)
const lightboxUrl = ref<string | null>(null)
const loadedMediaIds = ref<Set<string>>(new Set())
// Tracks whether the user is currently anchored to the bottom of the thread.
// Updated from real scroll events so it's never stale by the time new content arrives.
const stickToBottom = ref(true)
// While true, the activeMessages watcher defers to the conversation-switch logic below
// instead of racing it — avoids the two watchers fighting over when to scroll.
const isSwitchingConversation = ref(false)

function isMediaLoaded(id: string) { return loadedMediaIds.value.has(id) }
async function markMediaLoaded(id: string) {
  loadedMediaIds.value = new Set([...loadedMediaIds.value, id])
  await nextTick()
  if (stickToBottom.value) scrollToBottom()
}

// ── Computed ────────────────────────────────────────────────────────────────
const filteredConversations = computed(() => {
  if (!convSearch.value.trim()) return conversations.value
  const q = convSearch.value.toLowerCase()
  return conversations.value.filter(c => {
    const p = getConversationPartner(c)
    const name = (p?.name || p?.username || '').toLowerCase()
    return name.includes(q)
  })
})

const activeConversation = computed<Conversation | undefined>(() =>
  conversations.value.find(c => c.id === activeConvId.value),
)
const activePartner = computed<ChatUser | null>(() =>
  activeConversation.value ? getConversationPartner(activeConversation.value) : null,
)
const activeMessages = computed<ChatMessage[]>(() =>
  activeConvId.value ? (messages.value[activeConvId.value] ?? []) : [],
)
const isPartnerOnline = computed(() =>
  activePartner.value ? isOnline(activePartner.value.id) : false,
)
const isPartnerTyping = computed(() => {
  if (!activeConvId.value || !activePartner.value) return false
  return (typingUsers.value[activeConvId.value] ?? []).includes(activePartner.value.id)
})

function closeMsgMenu() { openMenuMsgId.value = null }
function toggleMsgMenu(id: string) {
  openMenuMsgId.value = openMenuMsgId.value === id ? null : id
}
function toggleConvMenu(id: string) {
  openConvMenuId.value = openConvMenuId.value === id ? null : id
}
function confirmPurgeConversation(convId: string) {
  openConvMenuId.value = null
  pendingPurgeConvId.value = convId
}
async function executePurgeConversation() {
  if (!pendingPurgeConvId.value) return
  await purgeConversation(pendingPurgeConvId.value)
  pendingPurgeConvId.value = null
}
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (openMenuMsgId.value && !target.closest('[data-msg-menu]')) {
    closeMsgMenu()
  }
  if (showSettingsMenu.value && !target.closest('[data-settings-menu]')) {
    showSettingsMenu.value = false
  }
  if (openConvMenuId.value && !target.closest('[data-conv-menu]')) {
    openConvMenuId.value = null
  }
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  init()
  if (!token.value) { navigateTo('/login'); return }
  connect()
  await loadConversations()

  // activeConvId can already be set from a previous visit (composable state
  // persists across navigation), in which case the activeConvId watcher below
  // won't fire again — so jump to the bottom explicitly for this fresh mount.
  const convId = activeConvId.value
  if (convId) {
    mobileView.value = 'thread'
    isSwitchingConversation.value = true
    stickToBottom.value = true
    if (!messages.value[convId]) await loadMessages(convId)
    markSeen(convId)
    await nextTick()
    scrollToBottom()
    isSwitchingConversation.value = false
  }
})

onUnmounted(() => {
  disconnect()
  document.removeEventListener('click', handleDocumentClick)
})

function handleLogout() {
  showSettingsMenu.value = false
  disconnect()
  logout()
  navigateTo('/login')
}

// Auto-scroll when messages arrive, but only if user is already anchored to the bottom
// (otherwise it snaps back down while they're scrolling up through history).
// Skipped while a conversation switch is in flight — that flow owns the scroll itself.
watch(activeMessages, async () => {
  if (isSwitchingConversation.value) return
  const stick = stickToBottom.value
  await nextTick()
  if (stick) scrollToBottom()
}, { deep: true })

// Load messages when switching conversation — always jump to the newest message
watch(activeConvId, async newId => {
  if (!newId) return
  isSwitchingConversation.value = true
  stickToBottom.value = true
  if (!messages.value[newId]) await loadMessages(newId)
  markSeen(newId)
  await nextTick()
  scrollToBottom()
  isSwitchingConversation.value = false
})

// ── Methods ─────────────────────────────────────────────────────────────────
function isNearBottom(threshold = 120) {
  const el = messageListRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

function handleMessageListScroll() {
  stickToBottom.value = isNearBottom()
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
  stickToBottom.value = true
}

function selectConversation(id: string) {
  activeConvId.value = id
  mobileView.value = 'thread'
  showNewConv.value = false
}

let typingThrottle: ReturnType<typeof setTimeout> | null = null
function handleDraftInput() {
  if (!activeConvId.value || typingThrottle) return
  sendTyping(activeConvId.value)
  typingThrottle = setTimeout(() => { typingThrottle = null }, 2000)
}

function sendDraft() {
  const text = draft.value.trim()
  if (!text || !activeConvId.value) return
  sendMessage(activeConvId.value, text)
  draft.value = ''
}

function handleDraftKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDraft() }
}

// Edit
function startEdit(msg: ChatMessage) {
  closeMsgMenu()
  editingMsgId.value = msg.id
  editContent.value = msg.content
}
function cancelEdit() { editingMsgId.value = null; editContent.value = '' }
async function confirmEdit() {
  if (!editContent.value.trim() || !activeConvId.value || !editingMsgId.value) return
  await updateMessage(activeConvId.value, editingMsgId.value, editContent.value.trim())
  cancelEdit()
}

// Delete
async function confirmDelete(msgId: string) {
  closeMsgMenu()
  if (!activeConvId.value) return
  await deleteMessage(activeConvId.value, msgId)
}

// New conversation search
let searchDebounce: ReturnType<typeof setTimeout> | null = null
function onNewConvInput() {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(async () => {
    newConvSearching.value = true
    newConvResults.value = await searchUsers(newConvSearch.value)
    newConvSearching.value = false
  }, 350)
}

async function startConversation(user: ChatUser) {
  const conv = await createDirectConversation(user.id)
  showNewConv.value = false
  newConvSearch.value = ''
  newConvResults.value = []
  if (conv) selectConversation(conv.id)
}

// Image / video upload
async function handleMediaUpload(file: File) {
  if (!activeConvId.value) return
  uploadingImage.value = true
  const url = await uploadMedia(file)
  uploadingImage.value = false
  if (url) {
    const msgType = file.type.startsWith('video/') ? 'video' : 'image'
    sendMessage(activeConvId.value, url, msgType)
  }
}

function handleFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (fileInputRef.value) fileInputRef.value.value = ''
  handleMediaUpload(file)
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const it of items) {
    if (it.type.startsWith('image/')) {
      const file = it.getAsFile()
      if (file) { e.preventDefault(); handleMediaUpload(file) }
      break
    }
  }
}

// ── Media resolution ────────────────────────────────────────────────────────
type MediaKind = 'image' | 'video' | 'gif' | 'sticker' | 'text' | 'deleted'
interface ResolvedMedia { kind: MediaKind; url: string | null }
interface ResolvedMessage extends ChatMessage { _media: ResolvedMedia }

const { public: { apiBase } } = useRuntimeConfig()

function resolveMedia(msg: ChatMessage): ResolvedMedia {
  if (msg.deleted_at) return { kind: 'deleted', url: null }

  // Content can be missing/undefined for messages the server has blanked out
  // (e.g. a legacy omitempty response) — never let that crash the whole list.
  const content = msg.content ?? ''

  // New format: explicit message_type
  if (msg.message_type === 'image') return { kind: 'image', url: content }
  if (msg.message_type === 'video') return { kind: 'video', url: content }
  if (msg.message_type === 'gif') return { kind: 'gif', url: content }
  if (msg.message_type === 'sticker') return { kind: 'sticker', url: content }

  // Legacy format: __lh_media__:{"kind":"gif"|"image"|"video"|"sticker","url":"..."}
  // Prefix '__lh_media__:' = 13 characters
  if (content.startsWith('__lh_media__:')) {
    try {
      const parsed = JSON.parse(content.slice(13)) as { kind?: string; url?: string }
      if (parsed.url) {
        // Relative URL (sticker từ server) → prepend apiBase
        const url = parsed.url.startsWith('/') ? `${apiBase}${parsed.url}` : parsed.url
        const kind: MediaKind =
          parsed.kind === 'video' ? 'video'
          : parsed.kind === 'gif' ? 'gif'
          : parsed.kind === 'sticker' ? 'sticker'
          : 'image'
        return { kind, url }
      }
    } catch { /* fall through */ }
  }

  // Fallback: phát hiện qua URL khi server không trả về message_type đúng
  const raw = content.trim()
  if (/^https?:\/\/\S+$/i.test(raw)) {
    const clean = raw.split('?')[0]!.toLowerCase()
    if (/\.(jpe?g|jpg|png|webp|avif|gif|bmp|svg|jfif)$/i.test(clean))
      return { kind: clean.endsWith('.gif') ? 'gif' : 'image', url: raw }
    if (/\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(clean))
      return { kind: 'video', url: raw }
  }

  return { kind: 'text', url: null }
}

const resolvedMessages = computed<ResolvedMessage[]>(() =>
  activeMessages.value.map(msg => ({ ...msg, _media: resolveMedia(msg) })),
)

// ── Helpers ──────────────────────────────────────────────────────────────────
function partnerName(conv: Conversation) {
  const p = getConversationPartner(conv)
  return p?.name || p?.username || 'Unknown'
}
function partnerInitial(conv: Conversation) {
  return partnerName(conv).charAt(0).toUpperCase()
}
function convPreview(conv: Conversation) {
  const last = latestMessage.value[conv.id]
  if (!last) return ''
  const isMe = last.sender_id === currentUser.value?.id
  const prefix = isMe ? 'Bạn: ' : ''
  const media = resolveMedia(last)
  if (media.kind === 'deleted') return prefix + 'Tin nhắn đã bị xoá'
  if (media.kind === 'image') return prefix + '📷 Ảnh'
  if (media.kind === 'gif') return prefix + '🎞️ GIF'
  if (media.kind === 'sticker') return prefix + '🩵 Sticker'
  if (media.kind === 'video') return prefix + '🎥 Video'
  const text = last.content ?? ''
  return prefix + (text.length > 40 ? text.slice(0, 40) + '…' : text)
}
function convTime(conv: Conversation) {
  return formatConvTime(latestMessage.value[conv.id]?.created_at ?? conv.last_message_at)
}
function isOwnMessage(msg: ChatMessage) {
  return msg.sender_id === currentUser.value?.id
}
function partnerStatusText() {
  if (!activePartner.value) return ''
  if (isPartnerOnline.value) return 'đang hoạt động'
  return 'hoạt động ' + formatLastSeen(activePartner.value)
}
</script>

<template>
  <div class="h-dvh overflow-hidden" :style="{ background: 'var(--gradient-soft)' }">
    <main class="h-full sm:p-4 md:p-6">
      <div
        class="grid h-full grid-cols-1 overflow-hidden border-border bg-card sm:rounded-3xl sm:border md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]"
        :style="{ boxShadow: 'var(--shadow-soft)' }"
      >
        <!-- ── Sidebar ───────────────────────────────────────────────────── -->
        <aside
          :class="[
            'min-h-0 flex-col border-border md:flex md:border-r',
            mobileView === 'list' ? 'flex' : 'hidden',
          ]"
        >
          <!-- Sidebar header -->
          <div class="border-b border-border p-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Tin nhắn</h2>
              <div class="flex items-center gap-1">
                <!-- WS indicator -->
                <span
                  :title="wsConnected ? 'Đã kết nối' : 'Đang kết nối…'"
                  :class="['h-2 w-2 rounded-full', wsConnected ? 'bg-green-500' : 'bg-yellow-400']"
                />
                <!-- New conversation button -->
                <button
                  class="ml-1 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title="Nhắn tin mới"
                  @click="showNewConv = !showNewConv; newConvSearch = ''; newConvResults = []"
                >
                  <MessageSquarePlus class="h-5 w-5" />
                </button>
                <!-- Settings -->
                <div data-settings-menu class="relative ml-1">
                  <button
                    class="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Cài đặt"
                    @click="showSettingsMenu = !showSettingsMenu"
                  >
                    <Settings class="h-5 w-5" />
                  </button>
                  <div
                    v-if="showSettingsMenu"
                    class="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
                  >
                    <button
                      class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      @click="handleLogout"
                    >
                      <LogOut class="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- New conversation search -->
            <div v-if="showNewConv" class="mt-3">
              <div class="relative">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  v-model="newConvSearch"
                  placeholder="Tìm người dùng…"
                  class="h-10 w-full rounded-full bg-secondary pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  @input="onNewConvInput"
                />
                <button
                  v-if="newConvSearch"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  @click="newConvSearch = ''; newConvResults = []"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
              <div v-if="newConvResults.length" class="mt-2 space-y-1">
                <button
                  v-for="u in newConvResults"
                  :key="u.id"
                  class="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-secondary"
                  @click="startConversation(u)"
                >
                  <div
                    class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                    :style="{ background: 'var(--gradient-warm)' }"
                  >
                    {{ (u.name || u.username || '?').charAt(0).toUpperCase() }}
                    <span
                      v-if="isOnline(u.id)"
                      class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"
                    />
                  </div>
                  <div class="min-w-0 text-left">
                    <div class="truncate text-sm font-medium">{{ u.name || u.username }}</div>
                    <div class="truncate text-xs text-muted-foreground">@{{ u.username }}</div>
                  </div>
                </button>
              </div>
              <p v-else-if="newConvSearch && !newConvSearching" class="mt-2 text-center text-xs text-muted-foreground">
                Không tìm thấy người dùng.
              </p>
            </div>

            <!-- Conversation search -->
            <div v-else class="relative mt-3">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="convSearch"
                placeholder="Tìm kiếm cuộc trò chuyện"
                class="h-10 w-full rounded-full bg-secondary pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <!-- Conversation list -->
          <div class="min-h-0 flex-1 overflow-y-auto p-2">
            <p v-if="!conversations.length" class="mt-6 text-center text-sm text-muted-foreground">
              Chưa có cuộc trò chuyện nào.
            </p>
            <div
              v-for="c in filteredConversations"
              :key="c.id"
              role="button"
              tabindex="0"
              :class="[
                'relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors',
                activeConvId === c.id ? 'bg-accent' : 'hover:bg-secondary',
              ]"
              @click="selectConversation(c.id)"
              @keydown.enter="selectConversation(c.id)"
            >
              <!-- Avatar + online dot -->
              <div class="relative shrink-0">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                  :style="{ background: 'var(--gradient-warm)' }"
                >
                  {{ partnerInitial(c) }}
                </div>
                <span
                  v-if="getConversationPartner(c) && isOnline(getConversationPartner(c)!.id)"
                  class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500"
                />
              </div>

              <!-- Name + preview + time -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-sm font-semibold">{{ partnerName(c) }}</span>
                  <span class="shrink-0 text-[11px] text-muted-foreground">{{ convTime(c) }}</span>
                </div>
                <p class="truncate text-xs text-muted-foreground">{{ convPreview(c) }}</p>
              </div>

              <!-- Conversation menu -->
              <div data-conv-menu class="relative shrink-0">
                <button
                  class="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title="Tuỳ chọn"
                  @click.stop="toggleConvMenu(c.id)"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </button>
                <div
                  v-if="openConvMenuId === c.id"
                  class="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
                  @click.stop
                >
                  <button
                    class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                    @click="confirmPurgeConversation(c.id)"
                  >
                    <Trash2 class="h-4 w-4" /> Xoá cuộc hội thoại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ── Thread ────────────────────────────────────────────────────── -->
        <section
          :class="[
            'min-h-0 flex-col md:flex',
            mobileView === 'thread' ? 'flex' : 'hidden',
          ]"
        >
          <!-- Thread header -->
          <header
            v-if="activeConversation"
            class="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-4"
          >
            <!-- Left: back + avatar + info -->
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                class="-ml-1 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
                aria-label="Quay lại"
                @click="mobileView = 'list'; activeConvId = null"
              >
                <ArrowLeft class="h-5 w-5" />
              </button>
              <div
                class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground sm:h-10 sm:w-10"
                :style="{ background: 'var(--gradient-warm)' }"
              >
                {{ partnerInitial(activeConversation) }}
                <span
                  v-if="isPartnerOnline"
                  class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"
                />
              </div>
              <div class="min-w-0 flex-1 overflow-hidden">
                <div class="truncate text-sm font-semibold">{{ partnerName(activeConversation) }}</div>
                <div :class="['truncate text-xs', isPartnerOnline ? 'text-green-500' : 'text-muted-foreground']">
                  {{ partnerStatusText() }}
                </div>
              </div>
            </div>
            <!-- Right: actions (phone/video ẩn trên mobile) -->
            <div class="flex shrink-0 items-center gap-0.5 text-muted-foreground sm:gap-1">
              <button
                class="hidden rounded-full p-2 hover:bg-accent hover:text-foreground sm:flex"
                title="Gọi thoại"
              >
                <Phone class="h-4 w-4" />
              </button>
              <button
                class="hidden rounded-full p-2 hover:bg-accent hover:text-foreground sm:flex"
                title="Gọi video"
              >
                <Video class="h-4 w-4" />
              </button>
              <!-- <button
                class="rounded-full p-2 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                title="Xoá cuộc trò chuyện"
                @click="deleteConversation(activeConversation.id)"
              >
                <Trash2 class="h-4 w-4" />
              </button> -->
            </div>
          </header>

          <!-- Empty state: no active conversation -->
          <div
            v-if="!activeConversation"
            class="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground"
          >
            <MessageSquarePlus class="h-12 w-12 opacity-30" />
            <p class="text-sm">Chọn một cuộc trò chuyện hoặc nhắn tin mới</p>
          </div>

          <!-- Message list -->
          <div
            v-else
            ref="messageListRef"
            class="min-h-0 flex-1 space-y-1.5 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-5 sm:py-5"
            @scroll="handleMessageListScroll"
          >
            <div
              v-for="msg in resolvedMessages"
              :key="msg.id"
              :class="['group flex w-full min-w-0', isOwnMessage(msg) ? 'justify-end' : 'justify-start']"
            >
              <!-- Bubble wrapper -->
              <div class="flex min-w-0 max-w-[80%] flex-col sm:max-w-[65%]">

                <!-- ── Edit mode (text only) ── -->
                <div v-if="editingMsgId === msg.id" class="flex items-end gap-2">
                  <textarea
                    v-model="editContent"
                    rows="2"
                    class="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    @keydown.enter.exact.prevent="confirmEdit"
                    @keydown.escape="cancelEdit"
                  />
                  <div class="flex flex-col gap-1 pb-1">
                    <button class="rounded-full p-1.5 text-green-600 hover:bg-green-100" title="Xác nhận" @click="confirmEdit">
                      <Check class="h-4 w-4" />
                    </button>
                    <button class="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" title="Huỷ" @click="cancelEdit">
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <!-- ── Normal bubble ── -->
                <div v-else class="flex items-end gap-1">

                  <!-- Action menu: own, non-deleted messages. Always visible (subtle) since
                       most usage here is touch/mobile, where hover never triggers. -->
                  <div
                    v-if="isOwnMessage(msg) && msg._media.kind !== 'deleted'"
                    data-msg-menu
                    class="relative mb-0.5 flex shrink-0 items-center opacity-60 transition-opacity hover:opacity-100"
                  >
                    <button
                      class="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      title="Tuỳ chọn"
                      @click="toggleMsgMenu(msg.id)"
                    >
                      <MoreHorizontal class="h-3.5 w-3.5" />
                    </button>
                    <div
                      v-if="openMenuMsgId === msg.id"
                      class="absolute bottom-full right-0 z-10 mb-1 w-32 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
                    >
                      <!-- Chỉ cho sửa tin nhắn text -->
                      <button
                        v-if="msg._media.kind === 'text'"
                        class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-foreground hover:bg-secondary"
                        @click="startEdit(msg)"
                      >
                        <Pencil class="h-3.5 w-3.5" /> Chỉnh sửa
                      </button>
                      <button
                        class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10"
                        @click="confirmDelete(msg.id)"
                      >
                        <Trash2 class="h-3.5 w-3.5" /> Xoá
                      </button>
                    </div>
                  </div>

                  <!-- ── IMAGE / GIF / STICKER ── -->
                  <div
                    v-if="msg._media.kind === 'image' || msg._media.kind === 'gif' || msg._media.kind === 'sticker'"
                    :class="[
                      'overflow-hidden rounded-2xl bg-muted',
                      isOwnMessage(msg) ? 'rounded-tr-sm' : 'rounded-tl-sm',
                    ]"
                    style="min-width: 120px"
                  >
                    <!-- Skeleton hiển thị khi ảnh S3 chưa tải xong -->
                    <div
                      v-if="!isMediaLoaded(msg.id)"
                      class="flex h-40 w-[200px] max-w-full items-center justify-center sm:h-52 sm:w-[240px]"
                    >
                      <span class="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                    </div>
                    <img
                      :src="msg._media.url!"
                      alt="ảnh"
                      referrerpolicy="no-referrer"
                      :class="[
                        'block max-h-64 max-w-full cursor-zoom-in object-cover transition-opacity hover:opacity-90 sm:max-h-80',
                        isMediaLoaded(msg.id) ? 'opacity-100' : 'absolute inset-0 h-0 w-0 opacity-0',
                      ]"
                      style="min-width: 120px"
                      loading="lazy"
                      @load="markMediaLoaded(msg.id)"
                      @error="markMediaLoaded(msg.id)"
                      @click="lightboxUrl = msg._media.url"
                    />
                    <div
                      :class="[
                        'bg-black/20 px-2 pb-1.5 pt-0.5 text-[10px] text-white/80',
                        isOwnMessage(msg) ? 'text-right' : 'text-left',
                      ]"
                    >
                      {{ formatMsgTime(msg.created_at) }}
                    </div>
                  </div>

                  <!-- ── VIDEO ── -->
                  <div
                    v-else-if="msg._media.kind === 'video'"
                    :class="[
                      'overflow-hidden rounded-2xl bg-black',
                      isOwnMessage(msg) ? 'rounded-tr-sm' : 'rounded-tl-sm',
                    ]"
                    style="min-width: 180px"
                  >
                    <!-- Skeleton khi video chưa sẵn sàng -->
                    <div
                      v-if="!isMediaLoaded(msg.id)"
                      class="flex h-40 w-[240px] max-w-full items-center justify-center sm:h-48 sm:w-[280px]"
                    >
                      <span class="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                    </div>
                    <video
                      :src="msg._media.url!"
                      controls
                      playsinline
                      preload="metadata"
                      :class="[
                        'block max-h-64 max-w-full sm:max-h-80',
                        isMediaLoaded(msg.id) ? 'opacity-100' : 'h-0 opacity-0',
                      ]"
                      style="min-width: 180px"
                      @loadedmetadata="markMediaLoaded(msg.id)"
                      @error="markMediaLoaded(msg.id)"
                    />
                    <div
                      :class="[
                        'bg-black/30 px-2 pb-1.5 pt-0.5 text-[10px] text-white/70',
                        isOwnMessage(msg) ? 'text-right' : 'text-left',
                      ]"
                    >
                      {{ formatMsgTime(msg.created_at) }}
                    </div>
                  </div>

                  <!-- ── DELETED ── -->
                  <div
                    v-else-if="msg._media.kind === 'deleted'"
                    :class="[
                      'max-w-full rounded-2xl border border-dashed border-border px-3.5 py-2 text-sm italic text-muted-foreground sm:px-4 sm:py-2.5',
                      isOwnMessage(msg) ? 'rounded-tr-md' : 'rounded-tl-md',
                    ]"
                  >
                    Tin nhắn đã bị xoá
                  </div>

                  <!-- ── TEXT ── -->
                  <div
                    v-else
                    :class="[
                      'max-w-full break-words rounded-2xl px-3.5 py-2 text-sm sm:px-4 sm:py-2.5',
                      isOwnMessage(msg)
                        ? 'rounded-tr-md text-primary-foreground'
                        : 'rounded-tl-md bg-muted text-foreground',
                    ]"
                    :style="isOwnMessage(msg) ? { background: 'var(--gradient-warm)' } : undefined"
                  >
                    <span class="whitespace-pre-wrap break-all">{{ msg.content }}</span>
                    <div
                      :class="[
                        'mt-0.5 text-[10px]',
                        isOwnMessage(msg) ? 'text-primary-foreground/60' : 'text-muted-foreground',
                      ]"
                    >
                      {{ formatMsgTime(msg.created_at) }}
                      <span v-if="msg.updated_at && msg.updated_at !== msg.created_at"> · đã sửa</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isPartnerTyping" class="flex justify-start">
              <div class="rounded-2xl rounded-tl-md bg-muted px-4 py-2.5">
                <span class="inline-flex gap-1">
                  <span class="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                  <span class="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                  <span class="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          </div>

          <!-- Compose bar -->
          <form
            v-if="activeConversation"
            class="border-t border-border p-3 sm:p-4"
            @submit.prevent="sendDraft"
          >
            <!-- Hidden file input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*,video/*"
              class="hidden"
              @change="handleFileSelected"
            />

            <div class="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2">
              <!-- Image upload button -->
              <button
                type="button"
                :disabled="uploadingImage"
                class="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                title="Gửi ảnh / video"
                @click="fileInputRef?.click()"
              >
                <span v-if="uploadingImage" class="flex h-4 w-4 items-center justify-center">
                  <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </span>
                <ImagePlus v-else class="h-4 w-4" />
              </button>

              <textarea
                v-model="draft"
                rows="1"
                placeholder="Nhập tin nhắn…"
                class="max-h-32 min-h-[2rem] flex-1 resize-none bg-transparent text-sm leading-6 placeholder:text-muted-foreground focus:outline-none"
                @input="handleDraftInput"
                @keydown="handleDraftKeydown"
                @paste="onPaste"
              />
              <button
                type="submit"
                :disabled="!draft.trim()"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground transition-opacity disabled:opacity-40"
                :style="{ background: 'var(--gradient-warm)' }"
              >
                <Send class="h-4 w-4" />
              </button>
            </div>
            <!-- <p class="mt-1 hidden text-[11px] text-muted-foreground sm:block">Enter để gửi · Shift+Enter xuống dòng</p> -->
          </form>
        </section>
      </div>
    </main>

    <!-- Lightbox -->

    <Teleport to="body">
      <Transition name="lb">
        <div
          v-if="lightboxUrl"
          class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          @click.self="lightboxUrl = null"
        >
          <!-- Close button — safe-area aware -->
          <button
            class="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm hover:bg-white/25 active:scale-95"
            style="top: max(1rem, env(safe-area-inset-top))"
            @click="lightboxUrl = null"
          >
            <X class="h-5 w-5" />
          </button>

          <!-- Image fills screen, tap outside to close -->
          <img
            :src="lightboxUrl"
            alt="ảnh phóng to"
            class="max-h-[92dvh] max-w-[96dvw] select-none rounded-lg object-contain shadow-2xl"
            draggable="false"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>

    <!-- Purge conversation confirmation -->
    <Teleport to="body">
      <Transition name="lb">
        <div
          v-if="pendingPurgeConvId"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="pendingPurgeConvId = null"
        >
          <div class="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl">
            <h3 class="text-base font-semibold">Xoá vĩnh viễn cuộc trò chuyện?</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Toàn bộ tin nhắn sẽ bị xoá cho cả hai bên và không thể khôi phục.
            </p>
            <div class="mt-4 flex justify-end gap-2">
              <button
                class="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                @click="pendingPurgeConvId = null"
              >
                Huỷ
              </button>
              <button
                class="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
                @click="executePurgeConversation"
              >
                Xoá vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Lightbox fade */
.lb-enter-active,
.lb-leave-active { transition: opacity 0.18s ease; }
.lb-enter-from,
.lb-leave-to { opacity: 0; }
</style>

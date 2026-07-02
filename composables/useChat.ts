export interface ChatUser {
  id: string
  name?: string
  username?: string
  avatar?: string
  last_seen_at?: string
}

export interface ConversationMember {
  id: string
  conversation_id: string
  user_id: string
  user: ChatUser
  last_read_at?: string
}

export interface Conversation {
  id: string
  type: string
  last_message_at?: string
  members: ConversationMember[]
  last_message?: ChatMessage
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender: ChatUser
  content: string
  message_type: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// ── Singleton state ──────────────────────────────────────────────────────────
const _ws = ref<WebSocket | null>(null)
const _wsConnected = ref(false)
const _conversations = ref<Conversation[]>([])
const _activeConvId = ref<string | null>(null)
const _messages = ref<Record<string, ChatMessage[]>>({})
const _latestMessage = ref<Record<string, ChatMessage>>({})
const _onlineUserIds = ref<string[]>([])
const _typingUsers = ref<Record<string, string[]>>({})

let _reconnectTimer: ReturnType<typeof setTimeout> | null = null

export const useChat = () => {
  const config = useRuntimeConfig()
  const { token, currentUser } = useAuth()

  // ── API helpers ────────────────────────────────────────────────────────────
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: token.value ? `Bearer ${token.value}` : '',
    }
  }

  async function loadConversations() {
    if (!token.value) return
    try {
      const res = await fetch(`${config.public.apiBase}/api/conversations.json`, { headers: authHeaders() })
      const data = await res.json() as { status: boolean; data?: Conversation[] }
      if (data.status && data.data) {
        _conversations.value = data.data
        for (const conv of data.data) {
          if (conv.last_message) _latestMessage.value[conv.id] = conv.last_message
        }
      }
    } catch { /* ignore */ }
  }

  async function loadMessages(convId: string) {
    if (!token.value) return
    try {
      const res = await fetch(
        `${config.public.apiBase}/api/conversations/${convId}/messages.json?limit=60`,
        { headers: authHeaders() },
      )
      const data = await res.json() as { status: boolean; data?: ChatMessage[] }
      if (data.status && data.data) {
        const ordered = [...data.data].reverse()
        _messages.value[convId] = ordered
        if (ordered.length) _latestMessage.value[convId] = ordered[ordered.length - 1]!
      }
    } catch { /* ignore */ }
  }

  async function searchUsers(q: string): Promise<ChatUser[]> {
    if (!token.value || !q.trim()) return []
    try {
      const res = await fetch(
        `${config.public.apiBase}/api/users/search.json?q=${encodeURIComponent(q)}`,
        { headers: authHeaders() },
      )
      const data = await res.json() as { status: boolean; data?: ChatUser[] }
      return data.status && data.data ? data.data : []
    } catch { return [] }
  }

  async function createDirectConversation(userId: string): Promise<Conversation | null> {
    if (!token.value) return null
    try {
      const res = await fetch(`${config.public.apiBase}/api/conversations/direct.json`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ user_id: userId }),
      })
      const data = await res.json() as { status: boolean; data?: Conversation }
      if (data.status && data.data) {
        const conv = data.data
        if (!_conversations.value.find(c => c.id === conv.id)) {
          _conversations.value = [conv, ..._conversations.value]
        }
        return conv
      }
    } catch { /* ignore */ }
    return null
  }

  async function deleteConversation(convId: string) {
    if (!token.value) return
    try {
      await fetch(`${config.public.apiBase}/api/conversations/${convId}.json`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
    } catch { /* ignore */ }
    _conversations.value = _conversations.value.filter(c => c.id !== convId)
    if (_activeConvId.value === convId) _activeConvId.value = null
  }

  // Permanently deletes the conversation, its messages and memberships for
  // every participant (unlike deleteConversation, which only leaves it).
  async function purgeConversation(convId: string) {
    if (!token.value) return
    try {
      await fetch(`${config.public.apiBase}/api/conversations/${convId}/purge.json`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
    } catch { /* ignore */ }
    _conversations.value = _conversations.value.filter(c => c.id !== convId)
    delete _messages.value[convId]
    delete _latestMessage.value[convId]
    if (_activeConvId.value === convId) _activeConvId.value = null
  }

  async function deleteMessage(convId: string, msgId: string) {
    if (!token.value) return
    try {
      const res = await fetch(`${config.public.apiBase}/api/conversations/${convId}/messages/${msgId}.json`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json() as { status: boolean }
      // Update immediately rather than waiting for the message_deleted WS event to round-trip.
      if (data.status && _messages.value[convId]) {
        _messages.value[convId] = _messages.value[convId].map(m =>
          m.id === msgId ? { ...m, content: '', deleted_at: new Date().toISOString() } : m,
        )
      }
    } catch { /* ignore */ }
  }

  async function updateMessage(convId: string, msgId: string, content: string) {
    if (!token.value) return
    try {
      await fetch(`${config.public.apiBase}/api/conversations/${convId}/messages/${msgId}.json`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      })
    } catch { /* ignore */ }
  }

  // ── WebSocket ──────────────────────────────────────────────────────────────
  function wsSend(data: unknown) {
    if (_ws.value?.readyState === WebSocket.OPEN) _ws.value.send(JSON.stringify(data))
  }

  function sendMessage(convId: string, content: string, messageType = 'text') {
    wsSend({ type: 'send_message', conversation_id: convId, content, message_type: messageType })
  }

  async function uploadMedia(file: File): Promise<string | null> {
    if (!token.value) return null
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`${config.public.apiBase}/api/media/upload.json`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: form,
      })
      const data = await res.json() as {
        status: boolean
        url?: string
        data?: { url?: string; location?: string; path?: string } | string
      }
      if (!data.status) return null
      if (typeof data.url === 'string' && data.url) return data.url
      if (typeof data.data === 'string' && data.data) return data.data
      if (data.data && typeof data.data === 'object') {
        return data.data.url || data.data.location || data.data.path || null
      }
      return null
    } catch {
      return null
    }
  }

  function sendTyping(convId: string) {
    wsSend({ type: 'typing', conversation_id: convId })
  }

  function markSeen(convId: string) {
    wsSend({ type: 'seen', conversation_id: convId })
  }

  function _addOrUpdateOnline(uid: string) {
    if (!_onlineUserIds.value.includes(uid)) _onlineUserIds.value = [..._onlineUserIds.value, uid]
  }

  function _removeOnline(uid: string) {
    _onlineUserIds.value = _onlineUserIds.value.filter(id => id !== uid)
  }

  function _handleEvent(raw: string) {
    let ev: {
      type: string
      conversation_id?: string
      data?: Record<string, unknown>
      message?: string
    }
    try { ev = JSON.parse(raw) } catch { return }

    const convId = ev.conversation_id

    switch (ev.type) {
      case 'connected': {
        const ids = (ev.data?.online_users ?? []) as string[]
        _onlineUserIds.value = ids
        break
      }

      case 'message': {
        if (!convId || !ev.data) break
        const msg = ev.data as unknown as ChatMessage
        if (!_messages.value[convId]) _messages.value[convId] = []
        if (!_messages.value[convId].find(m => m.id === msg.id)) {
          _messages.value[convId] = [..._messages.value[convId], msg]
          _latestMessage.value[convId] = msg
        }
        // Bubble conversation to top
        const conv = _conversations.value.find(c => c.id === convId)
        if (conv) {
          conv.last_message_at = msg.created_at
          _conversations.value = [conv, ..._conversations.value.filter(c => c.id !== convId)]
        }
        break
      }

      case 'message_updated': {
        if (!convId || !ev.data) break
        const updated = ev.data as unknown as ChatMessage
        if (_messages.value[convId]) {
          _messages.value[convId] = _messages.value[convId].map(m =>
            m.id === updated.id ? updated : m,
          )
        }
        break
      }

      case 'message_deleted': {
        if (!convId || !ev.data) break
        const deletedId = ev.data.message_id as string
        if (_messages.value[convId]) {
          _messages.value[convId] = _messages.value[convId].map(m =>
            m.id === deletedId ? { ...m, content: '', deleted_at: new Date().toISOString() } : m,
          )
        }
        break
      }

      case 'conversation_deleted': {
        if (!convId) break
        _conversations.value = _conversations.value.filter(c => c.id !== convId)
        delete _messages.value[convId]
        delete _latestMessage.value[convId]
        if (_activeConvId.value === convId) _activeConvId.value = null
        break
      }

      case 'user_online': {
        const uid = ev.data?.user_id as string | undefined
        if (uid) _addOrUpdateOnline(uid)
        break
      }

      case 'user_offline': {
        const uid = ev.data?.user_id as string | undefined
        if (uid) {
          _removeOnline(uid)
          // Update last_seen_at in member records
          const lastSeen = ev.data?.last_seen_at as string | undefined
          if (lastSeen) {
            _conversations.value.forEach(c => {
              c.members?.forEach(m => {
                if (m.user_id === uid) m.user.last_seen_at = lastSeen
              })
            })
          }
        }
        break
      }

      case 'seen': {
        if (!convId || !ev.data) break
        const uid = ev.data.user_id as string
        const time = (ev.data.time as string) || new Date().toISOString()
        const conv = _conversations.value.find(c => c.id === convId)
        conv?.members?.forEach(m => {
          if (m.user_id === uid) m.last_read_at = time
        })
        break
      }

      case 'typing': {
        if (!convId || !ev.data) break
        const uid = ev.data.user_id as string
        if (uid && uid !== currentUser.value?.id) {
          const list = _typingUsers.value[convId] ?? []
          if (!list.includes(uid)) {
            _typingUsers.value = { ..._typingUsers.value, [convId]: [...list, uid] }
          }
          setTimeout(() => {
            _typingUsers.value = {
              ..._typingUsers.value,
              [convId]: (_typingUsers.value[convId] ?? []).filter(id => id !== uid),
            }
          }, 3000)
        }
        break
      }
    }
  }

  function connect() {
    if (import.meta.server || !token.value) return
    if (_ws.value && _ws.value.readyState <= WebSocket.OPEN) return

    const url = `${config.public.wsBase}/ws/chat?token=${token.value}`
    const ws = new WebSocket(url)

    ws.onopen = () => {
      _wsConnected.value = true
      if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null }
    }
    ws.onmessage = e => _handleEvent(e.data as string)
    ws.onclose = () => {
      _wsConnected.value = false
      _ws.value = null
      if (token.value) _reconnectTimer = setTimeout(connect, 4000)
    }
    ws.onerror = () => ws.close()

    _ws.value = ws
  }

  function disconnect() {
    if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null }
    _ws.value?.close()
    _ws.value = null
    _wsConnected.value = false
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function isOnline(userId: string) {
    return _onlineUserIds.value.includes(userId)
  }

  function getConversationPartner(conv: Conversation): ChatUser | null {
    if (!currentUser.value) return null
    return conv.members?.find(m => m.user_id !== currentUser.value!.id)?.user ?? null
  }

  // Hội thoại "chưa xem": tin cuối là của đối phương và mới hơn last_read_at của mình
  function isConvUnread(conv: Conversation): boolean {
    const meId = currentUser.value?.id
    if (!meId) return false
    const last = _latestMessage.value[conv.id]
    if (!last || last.sender_id === meId || !last.created_at) return false
    const me = conv.members?.find(m => m.user_id === meId)
    if (!me?.last_read_at) return true
    return new Date(last.created_at).getTime() > new Date(me.last_read_at).getTime()
  }

  function formatLastSeen(user: ChatUser): string {
    if (!user.last_seen_at) return 'ngoại tuyến'
    const diff = Date.now() - new Date(user.last_seen_at).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'vừa hoạt động'
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    return `${Math.floor(hours / 24)} ngày trước`
  }

  function formatConvTime(dateStr?: string): string {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'vừa xong'
    if (minutes < 60) return `${minutes} ph`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ`
    return `${Math.floor(hours / 24)} ngày`
  }

  function formatMsgTime(dateStr?: string): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return {
    // state
    conversations: _conversations,
    activeConvId: _activeConvId,
    messages: _messages,
    latestMessage: _latestMessage,
    onlineUserIds: _onlineUserIds,
    typingUsers: _typingUsers,
    wsConnected: _wsConnected,
    // API methods
    loadConversations,
    loadMessages,
    searchUsers,
    createDirectConversation,
    deleteConversation,
    purgeConversation,
    deleteMessage,
    updateMessage,
    // WS methods
    connect,
    disconnect,
    sendMessage,
    uploadMedia,
    sendTyping,
    markSeen,
    // helpers
    isOnline,
    isConvUnread,
    getConversationPartner,
    formatLastSeen,
    formatConvTime,
    formatMsgTime,
  }
}

export interface UserProfile {
  id: string
  name?: string
  email?: string
  username?: string
  phone?: string
  role?: string
  avatar?: string
  title?: string
  last_seen_at?: string
  created_at?: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  title?: string
  avatar?: string
}

const _profile = ref<UserProfile | null>(null)
const _loading = ref(false)

export const useProfile = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: token.value ? `Bearer ${token.value}` : '',
    }
  }

  async function loadProfile(): Promise<UserProfile | null> {
    if (!token.value) return null
    _loading.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/users/me.json`, { headers: authHeaders() })
      const data = await res.json() as { status: boolean; data?: UserProfile }
      if (data.status && data.data) {
        _profile.value = data.data
        return data.data
      }
      return null
    } catch {
      return null
    } finally {
      _loading.value = false
    }
  }

  async function loadUserProfile(userId: string): Promise<UserProfile | null> {
    if (!token.value) return null
    try {
      const res = await fetch(`${config.public.apiBase}/api/users/${userId}.json`, { headers: authHeaders() })
      const data = await res.json() as { status: boolean; data?: UserProfile }
      return data.status && data.data ? data.data : null
    } catch {
      return null
    }
  }

  async function updateProfile(payload: UpdateProfilePayload): Promise<{ ok: boolean; message: string }> {
    if (!token.value) return { ok: false, message: 'Chưa đăng nhập' }
    try {
      const res = await fetch(`${config.public.apiBase}/api/users/me.json`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json() as { status: boolean; message: string; data?: UserProfile }
      if (!data.status) return { ok: false, message: data.message || 'Cập nhật thất bại' }
      if (data.data) _profile.value = data.data
      return { ok: true, message: data.message }
    } catch {
      return { ok: false, message: 'Không thể kết nối đến server' }
    }
  }

  return {
    profile: _profile,
    profileLoading: _loading,
    loadProfile,
    loadUserProfile,
    updateProfile,
  }
}

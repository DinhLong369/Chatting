export interface AuthUser {
  id: string
  email: string
  username: string
  role: string
}

const _token = ref<string | null>(null)
const _currentUser = ref<AuthUser | null>(null)

function decodeJWT(jwt: string): Record<string, unknown> | null {
  try {
    const payload = jwt.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const useAuth = () => {
  function init() {
    if (import.meta.server) return
    const stored = localStorage.getItem('glow_token')
    if (!stored) return
    const claims = decodeJWT(stored)
    if (!claims || typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) {
      localStorage.removeItem('glow_token')
      return
    }
    _token.value = stored
    _currentUser.value = {
      id: claims.user_id as string,
      email: claims.email as string,
      username: claims.username as string,
      role: claims.role as string,
    }
  }

  async function login(account: string, password: string): Promise<{ ok: boolean; message: string }> {
    const config = useRuntimeConfig()
    try {
      const res = await fetch(`${config.public.apiBase}/api/auth/login.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
      })
      const data = await res.json() as { status: boolean; message: string; access_token?: string }
      if (!data.status || !data.access_token) return { ok: false, message: data.message }
      localStorage.setItem('glow_token', data.access_token)
      const claims = decodeJWT(data.access_token)!
      _token.value = data.access_token
      _currentUser.value = {
        id: claims.user_id as string,
        email: claims.email as string,
        username: claims.username as string,
        role: claims.role as string,
      }
      return { ok: true, message: data.message }
    } catch {
      return { ok: false, message: 'Không thể kết nối đến server' }
    }
  }

  function logout() {
    if (import.meta.server) return
    localStorage.removeItem('glow_token')
    _token.value = null
    _currentUser.value = null
  }

  return {
    token: _token,
    currentUser: _currentUser,
    init,
    login,
    logout,
  }
}

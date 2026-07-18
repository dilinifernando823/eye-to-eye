import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => clearUser())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, isAuthenticated }
}

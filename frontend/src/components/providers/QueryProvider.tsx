'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  // Cart/auth stores skip auto-hydration from localStorage so the very first
  // client render matches the server-rendered HTML (which has no localStorage
  // access). Rehydrate here, once, after mount — see cartStore.ts/authStore.ts.
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useAuthStore.persist.rehydrate()
  }, [])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

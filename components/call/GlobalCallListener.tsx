// components/call/GlobalCallListener.tsx — Real-time Incoming Call Detector & Ringing Dispatcher
import React, { useEffect, useRef } from 'react'
import { usePathname, router } from 'expo-router'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'

export function GlobalCallListener() {
  const { isAuthenticated, user } = useAuthStore()
  const pathname = usePathname()
  const activeCallHandledRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Don't poll if already on a call screen
    if (pathname.includes('/call/incoming') || pathname.includes('/call/active')) {
      return
    }

    const checkIncoming = async () => {
      try {
        const res = await api.get('/calls/active-incoming')
        const incoming = res.data

        if (incoming && incoming.callId && incoming.callId !== activeCallHandledRef.current) {
          activeCallHandledRef.current = incoming.callId
          router.push({
            pathname: '/call/incoming',
            params: {
              callId: incoming.callId,
              callType: incoming.callType || 'VOICE',
              callerName: incoming.callerName || 'Fan Member',
              callerAvatar: incoming.callerAvatar || '',
              roomUrl: incoming.roomUrl || '',
            },
          })
        }
      } catch {
        // Non-blocking
      }
    }

    // Check immediately and every 2.5 seconds
    checkIncoming()
    const interval = setInterval(checkIncoming, 2500)

    return () => clearInterval(interval)
  }, [isAuthenticated, user, pathname])

  return null
}

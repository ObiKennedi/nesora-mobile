// app/_layout.tsx — Root layout: bootstraps auth, push, query client

import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/lib/auth'
import { registerPushToken, setupPushListeners } from '@/lib/push'

export default function RootLayout() {
  const { checkAuth, isLoading, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/(auth)/login')
    } else if (!user?.onboardingType) {
      router.replace('/(onboarding)/select-type')
    } else {
      router.replace('/(fan)/feed')
    }
  }, [isLoading, isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated) return
    registerPushToken()
    const cleanup = setupPushListeners()
    return cleanup
  }, [isAuthenticated])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(fan)" />
          <Stack.Screen name="call" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

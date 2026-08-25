import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/lib/auth'
import { registerPushToken, setupPushListeners } from '@/lib/push'
import { GlobalCallListener } from '@/components/call/GlobalCallListener'

export default function RootLayout() {
  const { checkAuth, isLoading, isAuthenticated, user, activeMode } = useAuthStore()
  const segments = useSegments()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboardingGroup = segments[0] === '(onboarding)'

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login')
      }
    } else if (!user?.onboardingType) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/select-type')
      }
    } else if (inAuthGroup || inOnboardingGroup || segments.length === 0) {
      if (activeMode === 'CREATOR' || user?.onboardingType === 'CREATOR') {
        router.replace('/(creator)/dashboard' as any)
      } else {
        router.replace('/(fan)/feed')
      }
    }
  }, [isLoading, isAuthenticated, user?.onboardingType, activeMode, segments])



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
        <GlobalCallListener />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(fan)" />
          <Stack.Screen name="(creator)" />
          <Stack.Screen name="call" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}


// lib/push.ts — Expo push notification setup + incoming call handler

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { api } from './api'
import { router } from 'expo-router'

// ── Configure notification display behaviour ──────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as any
    // Call notifications always show over lock screen
    if (data?.type === 'INCOMING_CALL') {
      return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, priority: Notifications.AndroidNotificationPriority.MAX }
    }
    return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true, priority: Notifications.AndroidNotificationPriority.HIGH }
  },
})

// ── Register + save token ─────────────────────────────────────────────────────

export async function registerPushToken() {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device')
    return
  }

  // Android channels
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    })
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    })
    await Notifications.setNotificationChannelAsync('calls', {
      name: 'Incoming Calls',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      // Enables full-screen intent (show over lock screen)
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync() as any
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync() as any
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted')
    return
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '1fe332b9-dc07-4e06-9786-b9c1aca3af12',
  })

  try {
    await api.post('/push/register-token', { expoPushToken: tokenData.data })
    console.log('Push token registered:', tokenData.data)
  } catch (err) {
    console.error('Failed to register push token:', err)
  }
}

// ── Handle foreground notifications (taps and received) ──────────────────────

export function setupPushListeners() {
  // When a notification is tapped (from background/killed state)
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as any

    switch (data?.type) {
      case 'INCOMING_CALL':
        router.push({
          pathname: '/call/incoming',
          params: {
            callId: data.callId,
            callType: data.callType || data.type || 'VOICE',
            callerName: data.fan?.name || 'Fan Member',
            callerAvatar: data.fan?.image || '',
            conversationId: data.conversationId,
          },
        })
        break
      case 'CALL_ACCEPTED':
        router.push({ pathname: '/call/active', params: { callId: data.callId } })
        break
      case 'NEW_MESSAGE':
        router.push({
          pathname: '/(fan)/messages/[conversationId]' as any,
          params: { conversationId: data.conversationId },
        })
        break
      default:
        router.push('/(fan)/notifications' as any)
    }
  })

  // When a notification arrives while app is foregrounded
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data as any
    // Incoming call while app is open — navigate immediately to ring screen
    if (data?.type === 'INCOMING_CALL') {
      router.push({
        pathname: '/call/incoming',
        params: {
          callId: data.callId,
          callType: data.callType || data.type || 'VOICE',
          callerName: data.fan?.name || 'Fan Member',
          callerAvatar: data.fan?.image || '',
          conversationId: data.conversationId,
        },
      })
    }
  })


  return () => {
    responseSub.remove()
    receivedSub.remove()
  }
}

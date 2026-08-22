// app/call/incoming.tsx — Full-screen incoming call ring screen
// Shown when a VoIP push notification is received

import { useEffect, useRef } from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Animated, Vibration,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { api } from '@/lib/api'

export default function IncomingCallScreen() {
  const { callId, callType, fanName, fanImage, conversationId } = useLocalSearchParams<{
    callId: string
    callType: 'VOICE' | 'VIDEO'
    fanName: string
    fanImage?: string
    conversationId: string
  }>()

  // Pulse animation for the avatar ring
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Vibrate in a call pattern
    Vibration.vibrate([500, 500, 500, 500, 500], true)

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    )
    anim.start()

    // Auto-decline after 45 seconds (ring timeout)
    const timeout = setTimeout(() => handleDecline(), 45_000)

    return () => {
      Vibration.cancel()
      anim.stop()
      clearTimeout(timeout)
    }
  }, [])

  const handleAccept = async () => {
    Vibration.cancel()
    try {
      const { data } = await api.post(`/calls/${callId}/respond`, { accept: true })
      if (data.accepted) {
        router.replace({
          pathname: '/call/active',
          params: { callId, roomUrl: data.room.url, roomToken: data.room.token, callType },
        })
      }
    } catch {
      router.back()
    }
  }

  const handleDecline = async () => {
    Vibration.cancel()
    try {
      await api.post(`/calls/${callId}/respond`, { accept: false })
    } finally {
      router.back()
    }
  }

  return (
    <View style={s.root}>
      <Text style={s.callTypeLabel}>
        Incoming {callType === 'VOICE' ? '📞 Voice' : '📹 Video'} Call
      </Text>

      <View style={s.avatarContainer}>
        <Animated.View style={[s.pulseRing, { transform: [{ scale: pulse }] }]} />
        <Image
          source={{ uri: fanImage ?? 'https://via.placeholder.com/120' }}
          style={s.avatar}
        />
      </View>

      <Text style={s.callerName}>{fanName ?? 'A fan'}</Text>
      <Text style={s.callerSub}>is calling you</Text>

      <View style={s.buttons}>
        <TouchableOpacity style={s.declineBtn} onPress={handleDecline}>
          <Text style={s.btnEmoji}>📵</Text>
          <Text style={s.btnLabel}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.acceptBtn} onPress={handleAccept}>
          <Text style={s.btnEmoji}>{callType === 'VOICE' ? '📞' : '📹'}</Text>
          <Text style={s.btnLabel}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#0a0a0a',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  callTypeLabel: { color: '#a855f7', fontSize: 16, fontWeight: '600', marginBottom: 48, letterSpacing: 1 },
  avatarContainer: { width: 140, height: 140, marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 3, borderColor: '#a855f740',
  },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#a855f7' },
  callerName: { fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 8 },
  callerSub: { fontSize: 16, color: '#888', marginBottom: 72 },
  buttons: { flexDirection: 'row', gap: 48 },
  declineBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center',
  },
  acceptBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#34c759', alignItems: 'center', justifyContent: 'center',
  },
  btnEmoji: { fontSize: 28 },
  btnLabel: { color: '#fff', fontSize: 11, marginTop: 4, fontWeight: '600' },
})

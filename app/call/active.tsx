// app/call/active.tsx — Active call screen using Daily.co React Native SDK

import { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import DailyIframe from '@daily-co/react-native-daily-js'
import { api } from '@/lib/api'

export default function ActiveCallScreen() {
  const { callId, roomUrl, roomToken, callType } = useLocalSearchParams<{
    callId: string
    roomUrl: string
    roomToken: string
    callType: 'VOICE' | 'VIDEO'
  }>()

  const callRef = useRef<any>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isCamOff, setIsCamOff] = useState(callType !== 'VIDEO')
  const [participants, setParticipants] = useState(1)

  useEffect(() => {
    StatusBar.setHidden(true)

    // Join the Daily room
    const call = DailyIframe.createCallObject()
    callRef.current = call

    call.join({ url: roomUrl, token: roomToken }).catch(() => {
      Alert.alert('Error', 'Could not join the call.', [{ text: 'OK', onPress: () => endCall() }])
    })

    call.on('participant-joined', () => setParticipants((p) => p + 1))
    call.on('participant-left', () => setParticipants((p) => Math.max(1, p - 1)))
    call.on('left-meeting', () => router.back())
    call.on('error', () => endCall())

    // Elapsed timer
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)

    return () => {
      StatusBar.setHidden(false)
      clearInterval(interval)
      call.leave().catch(() => {})
      call.destroy()
    }
  }, [])

  const endCall = async () => {
    try {
      await callRef.current?.leave().catch(() => {})
      await api.post(`/calls/${callId}/end`)
    } finally {
      router.back()
    }
  }

  const toggleMute = () => {
    setIsMuted((m) => {
      callRef.current?.setLocalAudio(!m)
      return !m
    })
  }

  const toggleCam = () => {
    setIsCamOff((c) => {
      callRef.current?.setLocalVideo(!c)
      return !c
    })
  }

  const fmt = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <View style={s.root}>
      {/* Daily video tiles go here — in production use DailyMediaView */}
      <View style={s.videoArea}>
        <Text style={s.participantCount}>
          {participants > 1 ? '👥 Connected' : '⏳ Waiting for other party…'}
        </Text>
        <Text style={s.callType}>{callType === 'VOICE' ? '📞 Voice Call' : '📹 Video Call'}</Text>
        <Text style={s.timer}>{fmt(elapsed)}</Text>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <TouchableOpacity style={[s.ctrl, isMuted && s.ctrlActive]} onPress={toggleMute}>
          <Text style={s.ctrlEmoji}>{isMuted ? '🔇' : '🎙️'}</Text>
          <Text style={s.ctrlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        {callType === 'VIDEO' && (
          <TouchableOpacity style={[s.ctrl, isCamOff && s.ctrlActive]} onPress={toggleCam}>
            <Text style={s.ctrlEmoji}>{isCamOff ? '📷' : '📸'}</Text>
            <Text style={s.ctrlLabel}>{isCamOff ? 'Cam On' : 'Cam Off'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.endBtn} onPress={endCall}>
          <Text style={s.ctrlEmoji}>📵</Text>
          <Text style={s.ctrlLabel}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  videoArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  participantCount: { color: '#a855f7', fontSize: 16, fontWeight: '600' },
  callType: { color: '#888', fontSize: 16 },
  timer: { color: '#fff', fontSize: 48, fontWeight: '200', letterSpacing: 4, fontVariant: ['tabular-nums'] },
  controls: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    paddingBottom: 48, paddingHorizontal: 40,
  },
  ctrl: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
  },
  ctrlActive: { backgroundColor: '#2a2a2a' },
  endBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center',
  },
  ctrlEmoji: { fontSize: 26 },
  ctrlLabel: { color: '#aaa', fontSize: 10, marginTop: 4 },
})

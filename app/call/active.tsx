// app/call/active.tsx — WhatsApp-style Voice & Video Call UI powered by Daily.co

import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  PhoneOff,
  Shield,
  ChevronDown,
  User,
} from 'lucide-react-native'
import DailyIframe from '@daily-co/react-native-daily-js'
import { api } from '@/lib/api'
import { Colors } from '@/constants/theme'

export default function ActiveCallScreen() {
  const { callId, roomUrl, roomToken, callType, name, avatar } = useLocalSearchParams<{
    callId: string
    roomUrl: string
    roomToken: string
    callType: 'VOICE' | 'VIDEO'
    name?: string
    avatar?: string
  }>()

  const callRef = useRef<any>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [isCamOff, setIsCamOff] = useState(callType !== 'VIDEO')
  const [participants, setParticipants] = useState(1)

  const peerName = name || 'NESORA User'

  useEffect(() => {
    StatusBar.setBarStyle('light-content')

    // Join Daily room
    if (roomUrl) {
      const call = DailyIframe.createCallObject()
      callRef.current = call

      call.join({ url: roomUrl, token: roomToken }).catch(() => {
        Alert.alert('Connection Error', 'Could not connect to the call.', [
          { text: 'OK', onPress: () => endCall() },
        ])
      })

      call.on('participant-joined', () => setParticipants((p) => p + 1))
      call.on('participant-left', () => setParticipants((p) => Math.max(1, p - 1)))
      call.on('left-meeting', () => router.back())
      call.on('error', () => endCall())
    }

    // Elapsed timer
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)

    return () => {
      clearInterval(interval)
      if (callRef.current) {
        callRef.current.leave().catch(() => {})
        callRef.current.destroy()
      }
    }
  }, [])

  const endCall = async () => {
    try {
      if (callRef.current) {
        await callRef.current.leave().catch(() => {})
      }
      if (callId) {
        await api.post(`/calls/${callId}/end`).catch(() => {})
      }
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

  const toggleSpeaker = () => {
    setIsSpeaker((s) => !s)
  }

  const toggleCam = () => {
    setIsCamOff((c) => {
      callRef.current?.setLocalVideo(!c)
      return !c
    })
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B141A" />

      {/* Top Header Row */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.minimizeBtn} onPress={() => router.back()}>
          <ChevronDown size={28} color="#E9EDEF" />
        </TouchableOpacity>

        <View style={styles.encryptionBadge}>
          <Shield size={12} color="#8696A0" style={{ marginRight: 4 }} />
          <Text style={styles.encryptionText}>End-to-end encrypted</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {/* Caller Details & Avatar */}
      <View style={styles.callerSection}>
        <Text style={styles.callerName}>{peerName}</Text>
        <Text style={styles.callStatus}>
          {participants > 1
            ? formatTimer(elapsed)
            : 'Ringing...'}
        </Text>

        <View style={styles.avatarContainer}>
          <View style={styles.pulseRing} />
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={64} color="#8696A0" />
            </View>
          )}
        </View>
      </View>

      {/* Bottom Floating Control Bar (WhatsApp Style) */}
      <View style={styles.bottomBarWrapper}>
        <View style={styles.controlPill}>
          {/* Speaker Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isSpeaker && styles.actionBtnActive]}
            onPress={toggleSpeaker}
          >
            {isSpeaker ? (
              <Volume2 size={24} color="#0B141A" />
            ) : (
              <VolumeX size={24} color="#E9EDEF" />
            )}
          </TouchableOpacity>

          {/* Video Toggle Button */}
          <TouchableOpacity
            style={[styles.actionBtn, !isCamOff && styles.actionBtnActive]}
            onPress={toggleCam}
          >
            {!isCamOff ? (
              <Video size={24} color="#0B141A" />
            ) : (
              <VideoOff size={24} color="#E9EDEF" />
            )}
          </TouchableOpacity>

          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isMuted && styles.actionBtnActive]}
            onPress={toggleMute}
          >
            {isMuted ? (
              <MicOff size={24} color="#0B141A" />
            ) : (
              <Mic size={24} color="#E9EDEF" />
            )}
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
            <PhoneOff size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A', // WhatsApp Dark Theme background
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  minimizeBtn: {
    padding: 4,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionText: {
    color: '#8696A0',
    fontSize: 12,
    fontWeight: '500',
  },
  callerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  callerName: {
    color: '#E9EDEF',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  callStatus: {
    color: '#8696A0',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(134, 150, 160, 0.2)',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#1F2C34',
  },
  avatarFallback: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1F2C34',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2A3942',
  },
  bottomBarWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#1F2C34',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 340,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A3942',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#E9EDEF',
  },
  endCallBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DC2626', // Red end call button
    alignItems: 'center',
    justifyContent: 'center',
  },
})

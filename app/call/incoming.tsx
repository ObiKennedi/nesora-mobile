// app/call/incoming.tsx — WhatsApp-style Incoming Call Screen

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Phone, PhoneOff, Shield, User } from 'lucide-react-native'
import { api } from '@/lib/api'

export default function IncomingCallScreen() {
  const { callId, callerName, callerAvatar, callType, roomUrl, roomToken } =
    useLocalSearchParams<{
      callId: string
      callerName: string
      callerAvatar?: string
      callType: 'VOICE' | 'VIDEO'
      roomUrl: string
      roomToken: string
    }>()

  const displayName = callerName || 'NESORA Contact'

  const acceptCall = async () => {
    try {
      await api.post(`/calls/${callId}/accept`).catch(() => {})
    } finally {
      router.replace({
        pathname: '/call/active',
        params: {
          callId,
          roomUrl,
          roomToken,
          callType: callType || 'VOICE',
          name: displayName,
          avatar: callerAvatar || '',
        },
      })
    }
  }

  const rejectCall = async () => {
    try {
      await api.post(`/calls/${callId}/reject`).catch(() => {})
    } finally {
      router.back()
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B141A" />

      {/* Header Encryption Badge */}
      <View style={styles.header}>
        <Shield size={12} color="#8696A0" style={{ marginRight: 4 }} />
        <Text style={styles.encryptionText}>End-to-end encrypted</Text>
      </View>

      {/* Caller Info */}
      <View style={styles.callerSection}>
        <Text style={styles.callTypeLabel}>
          Incoming {callType === 'VIDEO' ? 'Video' : 'Voice'} Call
        </Text>
        <Text style={styles.callerName}>{displayName}</Text>

        <View style={styles.avatarContainer}>
          {callerAvatar ? (
            <Image source={{ uri: callerAvatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={64} color="#8696A0" />
            </View>
          )}
        </View>
      </View>

      {/* Accept / Decline Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Reject / Decline Button */}
        <TouchableOpacity style={styles.declineBtn} onPress={rejectCall}>
          <PhoneOff size={28} color="#FFFFFF" />
          <Text style={styles.btnLabel}>Decline</Text>
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
          <Phone size={28} color="#FFFFFF" />
          <Text style={styles.btnLabel}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encryptionText: {
    color: '#8696A0',
    fontSize: 12,
    fontWeight: '500',
  },
  callerSection: {
    alignItems: 'center',
  },
  callTypeLabel: {
    color: '#8696A0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  callerName: {
    color: '#E9EDEF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  declineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DC2626',
  },
  acceptBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16A34A', // WhatsApp green accept
  },
  btnLabel: {
    position: 'absolute',
    bottom: -24,
    color: '#E9EDEF',
    fontSize: 12,
    fontWeight: '500',
  },
})

// app/(fan)/messages/[conversationId].tsx — NESORA Chat screen with Voice & Video Calling
import React, { useState } from 'react'
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Image,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Send,
  Mic,
  Image as ImageIcon,
  Phone,
  Video,
  Sparkles,
  Crown,
  Clock,
  X,
} from 'lucide-react-native'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius, Shadows } from '@/constants/theme'

export default function ChatScreen() {
  const { conversationId, title } = useLocalSearchParams<{
    conversationId: string
    title?: string
  }>()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [text, setText] = useState('')

  // Call modal states
  const [callModalVisible, setCallModalVisible] = useState(false)
  const [selectedCallType, setSelectedCallType] = useState<'VOICE' | 'VIDEO'>('VOICE')
  const [checkingCall, setCheckingCall] = useState(false)
  const [callStatusData, setCallStatusData] = useState<any>(null)

  const headerTitle = title || 'Conversation'

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.get(`/messages/${conversationId}`).then((r) => r.data),
    refetchInterval: 3000,
  })

  const send = useMutation({
    mutationFn: (content: string) =>
      api.post(`/messages/${conversationId}/send`, { type: 'TEXT', content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] })
      setText('')
    },
  })

  // Initiate Call Mutation
  const initiateCallMutation = useMutation({
    mutationFn: async (callType: 'VOICE' | 'VIDEO') => {
      const res = await api.post('/calls/initiate', {
        conversationId,
        type: callType,
      })
      return res.data
    },
    onSuccess: (data, callType) => {
      setCallModalVisible(false)
      router.push({
        pathname: '/call/active',
        params: {
          callId: data.callId,
          roomUrl: data.roomUrl,
          roomToken: data.token,
          callType: callType,
          name: data.creatorName || callStatusData?.creatorName || headerTitle,
        },
      })
    },
    onError: (err: any) => {
      Alert.alert(
        'Could Not Connect',
        err?.response?.data?.message || 'Unable to initiate call. Please try again.',
      )
    },
  })

  const handlePressCall = async (type: 'VOICE' | 'VIDEO') => {
    try {
      setCheckingCall(true)
      const res = await api.get(`/calls/creator-status/${conversationId}`)
      const status = res.data
      setCallStatusData(status)
      setSelectedCallType(type)
      setCheckingCall(false)

      if (!status.availableForCalls) {
        Alert.alert(
          'Unavailable for Calls',
          `${status.creatorName || 'This creator'} is currently unavailable for calls right now.`,
        )
        return
      }

      if (type === 'VOICE' && !status.voiceCallsEnabled) {
        Alert.alert(
          'Voice Calls Disabled',
          `${status.creatorName || 'This creator'} has disabled voice calls.`,
        )
        return
      }

      if (type === 'VIDEO' && !status.videoCallsEnabled) {
        Alert.alert(
          'Video Calls Disabled',
          `${status.creatorName || 'This creator'} has disabled video calls.`,
        )
        return
      }

      setCallModalVisible(true)
    } catch (e: any) {
      setCheckingCall(false)
      Alert.alert(
        'Call Error',
        e?.response?.data?.message || 'Could not verify creator call status.',
      )
    }
  }

  const msgs = data?.messages ?? []

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Top Header with Call CTAs ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
        </View>

        {/* Call Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handlePressCall('VOICE')}
            disabled={checkingCall}
            activeOpacity={0.7}
          >
            <Phone size={18} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handlePressCall('VIDEO')}
            disabled={checkingCall}
            activeOpacity={0.7}
          >
            <Video size={18} color="#EA580C" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={msgs}
          keyExtractor={(m: any) => m.id}
          inverted
          renderItem={({ item }: any) => {
            const isMine = item.senderId === user?.id
            return (
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text style={[styles.msgText, isMine && styles.msgTextMine]}>
                  {item.content ??
                    (item.type === 'VOICE_NOTE'
                      ? '🎤 Voice note'
                      : '📷 Media attachment')}
                </Text>
              </View>
            )
          }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        />
      )}

      {/* ── Message Input Row ── */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Write a message..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={() => {
            if (text.trim()) send.mutate(text.trim())
          }}
          disabled={!text.trim() || send.isPending}
          activeOpacity={0.8}
        >
          {send.isPending ? (
            <ActivityIndicator size="small" color={Colors.surface} />
          ) : (
            <Send size={18} color={Colors.surface} />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Pre-Call Confirmation Modal ── */}
      <Modal
        visible={callModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCallModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setCallModalVisible(false)}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              {selectedCallType === 'VIDEO' ? (
                <Video size={30} color="#EA580C" />
              ) : (
                <Phone size={30} color="#2563EB" />
              )}
            </View>

            <Text style={styles.modalTitle}>
              Start {selectedCallType === 'VIDEO' ? 'Video' : 'Voice'} Call
            </Text>
            <Text style={styles.modalSubtitle}>
              Connect live with {callStatusData?.creatorName || headerTitle}
            </Text>

            {/* Rate & Top Fan Info */}
            <View style={styles.rateCard}>
              {callStatusData?.isTopFan ? (
                <View style={styles.topFanNotice}>
                  <Crown size={15} color="#D97706" />
                  <Text style={styles.topFanNoticeText}>
                    Top Supporter Benefit: Free Call Included!
                  </Text>
                </View>
              ) : (
                <View style={styles.rateDetailRow}>
                  <Clock size={15} color="#64748B" />
                  <Text style={styles.rateDetailText}>
                    Rate:{' '}
                    {selectedCallType === 'VOICE'
                      ? callStatusData?.voiceCallRatePerHour
                        ? `₦${(callStatusData.voiceCallRatePerHour / 60).toFixed(0)}/min`
                        : 'Free'
                      : callStatusData?.videoCallRatePerHour
                      ? `₦${(callStatusData.videoCallRatePerHour / 60).toFixed(0)}/min`
                      : 'Free'}
                  </Text>
                </View>
              )}
            </View>

            {/* Start Call Action */}
            <TouchableOpacity
              style={[
                styles.startCallBtn,
                selectedCallType === 'VIDEO' ? styles.bgOrange : styles.bgBlue,
              ]}
              onPress={() => initiateCallMutation.mutate(selectedCallType)}
              disabled={initiateCallMutation.isPending}
              activeOpacity={0.85}
            >
              {initiateCallMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  {selectedCallType === 'VIDEO' ? (
                    <Video size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  ) : (
                    <Phone size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.startCallBtnText}>Start Call Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: Radius.sm,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  msgText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  msgTextMine: {
    color: Colors.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 18,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  /* Pre-Call Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    position: 'relative',
    ...Shadows.md,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  rateCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  topFanNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  topFanNoticeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B45309',
  },
  rateDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rateDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  startCallBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    ...Shadows.sm,
  },
  bgOrange: { backgroundColor: '#EA580C' },
  bgBlue: { backgroundColor: '#2563EB' },
  startCallBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

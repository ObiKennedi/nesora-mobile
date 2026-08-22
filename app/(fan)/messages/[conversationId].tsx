// app/(fan)/messages/[conversationId].tsx — NESORA Chat screen

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
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Mic, Image as ImageIcon } from 'lucide-react-native'
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

  const headerTitle = title || 'Conversation'

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.get(`/messages/${conversationId}`).then((r) => r.data),
    refetchInterval: 3000, // Instant polling fallback
  })

  const send = useMutation({
    mutationFn: (content: string) =>
      api.post(`/messages/${conversationId}/send`, { type: 'TEXT', content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] })
      setText('')
    },
  })

  const msgs = data?.messages ?? []

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={{ width: 22 }} />
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

      {/* Message Input Row */}
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
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
  },
  bubbleMine: {
    backgroundColor: Colors.primary, // Terracotta brand color
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
})

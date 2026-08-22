// app/(fan)/messages/[conversationId].tsx — Chat screen

import { useState } from 'react'
import {
  View, FlatList, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [text, setText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.get(`/messages/${conversationId}`).then((r) => r.data),
    refetchInterval: 5000, // Poll every 5s as real-time alternative
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
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Chat</Text>
      </View>

      {isLoading ? (
        <View style={s.loading}><ActivityIndicator color="#a855f7" /></View>
      ) : (
        <FlatList
          data={msgs}
          keyExtractor={(m: any) => m.id}
          renderItem={({ item }: any) => {
            const mine = item.senderId === user?.id
            return (
              <View style={[s.bubble, mine ? s.mine : s.theirs]}>
                <Text style={[s.msgText, mine && s.msgTextMine]}>
                  {item.content ?? (item.type === 'VOICE_NOTE' ? '🎤 Voice note' : '📷 Media')}
                </Text>
              </View>
            )
          }}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        />
      )}

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor="#555"
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]}
          onPress={() => { if (text.trim()) send.mutate(text.trim()) }}
          disabled={!text.trim() || send.isPending}
        >
          <Text style={s.sendArrow}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 16 },
  back: { color: '#a855f7', fontSize: 24 },
  title: { color: '#fff', fontWeight: '700', fontSize: 18 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12, marginBottom: 8 },
  mine: { backgroundColor: '#a855f7', alignSelf: 'flex-end' },
  theirs: { backgroundColor: '#1a1a1a', alignSelf: 'flex-start' },
  msgText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  msgTextMine: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#1a1a1a', gap: 10 },
  input: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#333' },
  sendArrow: { color: '#fff', fontSize: 18 },
})

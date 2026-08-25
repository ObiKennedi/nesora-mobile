// app/(fan)/messages/index.tsx — Conversation list matching NESORA design system

import React, { useState, useCallback } from 'react'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  User,
  SquarePen,
  Mail,
  Plus,
  Sparkles,
} from 'lucide-react-native'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'
import { NewMessageModal } from '@/components/messages/NewMessageModal'

export default function MessagesScreen() {
  const queryClient = useQueryClient()
  const [modalVisible, setModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages').then((r) => r.data),
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['conversations'] })
    setRefreshing(false)
  }, [queryClient])

  const handleOpenConversation = (conversationId: string, title?: string) => {
    router.push({
      pathname: '/(fan)/messages/[conversationId]',
      params: {
        conversationId,
        title: title || 'Chat',
      },
    })
  }

  return (
    <View style={styles.root}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SquarePen size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item: any) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                handleOpenConversation(
                  item.id,
                  item.creator?.displayName || 'Chat',
                )
              }
              activeOpacity={0.7}
            >
              {item.creator?.user?.image ? (
                <Image
                  source={{ uri: item.creator.user.image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {(item.creator?.displayName || 'C')[0].toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.creator?.displayName || 'Creator'}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessageText ?? 'No messages yet'}
                </Text>
              </View>

              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconBox}>
                <Mail size={32} color={Colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySub}>
                Send a message request to start chatting with a creator
              </Text>

              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.emptyActionBtnText}>New Message</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={
            (!data || data.length === 0) ? { flex: 1 } : { paddingBottom: 20 }
          }
        />
      )}

      {/* ── New Message Modal ── */}
      <NewMessageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onOpenConversation={handleOpenConversation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE4',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F5F2',
    borderWidth: 1,
    borderColor: '#EAE6DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F2EE',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F2EE',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#1A202C',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 3,
  },
  preview: {
    color: '#718096',
    fontSize: 13.5,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#EAE6DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13.5,
    color: '#8C96A5',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  emptyActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})


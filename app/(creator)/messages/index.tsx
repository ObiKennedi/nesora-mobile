// app/(creator)/messages/index.tsx — Creator Direct Messages & Message Requests Manager
import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import {
  MessageCircle,
  Mail,
  CheckCircle2,
  X,
  UserCheck,
  Sparkles,
  Clock,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

type TabType = 'conversations' | 'requests'

export default function CreatorMessagesScreen() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('conversations')
  const [refreshing, setRefreshing] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  // 1. Fetch Conversations
  const { data: convData, isLoading: loadingConvs, refetch: refetchConvs } = useQuery({
    queryKey: ['creatorConversations'],
    queryFn: async () => {
      const res = await api.get('/messages')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  // 2. Fetch Creator Message Requests
  const { data: reqData, isLoading: loadingReqs, refetch: refetchReqs } = useQuery({
    queryKey: ['creatorMessageRequests'],
    queryFn: async () => {
      const res = await api.get('/messages/creator/requests')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchConvs(), refetchReqs()])
    setRefreshing(false)
  }

  // Accept Request Mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      setActingId(requestId)
      const res = await api.post(`/messages/creator/requests/${requestId}/accept`)
      return res.data
    },
    onSuccess: (data) => {
      setActingId(null)
      queryClient.invalidateQueries({ queryKey: ['creatorMessageRequests'] })
      queryClient.invalidateQueries({ queryKey: ['creatorConversations'] })
      if (data?.conversationId) {
        router.push({
          pathname: '/(fan)/messages/[conversationId]',
          params: { conversationId: data.conversationId },
        })
      }
    },
    onError: (err: any) => {
      setActingId(null)
      Alert.alert('Error', err?.response?.data?.message || 'Could not accept request.')
    },
  })

  // Decline Request Mutation
  const declineMutation = useMutation({
    mutationFn: async (requestId: string) => {
      setActingId(requestId)
      const res = await api.post(`/messages/creator/requests/${requestId}/decline`)
      return res.data
    },
    onSuccess: () => {
      setActingId(null)
      queryClient.invalidateQueries({ queryKey: ['creatorMessageRequests'] })
    },
    onError: (err: any) => {
      setActingId(null)
      Alert.alert('Error', err?.response?.data?.message || 'Could not decline request.')
    },
  })

  const conversations = convData ?? []
  const requests = reqData ?? []
  const pendingCount = requests.length

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fan Messages</Text>
      </View>

      {/* ── Sub-Header Segmented Tabs ── */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'conversations' && styles.tabActive]}
            onPress={() => setActiveTab('conversations')}
            activeOpacity={0.8}
          >
            <MessageCircle
              size={16}
              color={activeTab === 'conversations' ? Colors.primary : '#718096'}
              strokeWidth={activeTab === 'conversations' ? 2.3 : 1.8}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'conversations' && styles.tabTextActive,
              ]}
            >
              Conversations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
            activeOpacity={0.8}
          >
            <Mail
              size={16}
              color={activeTab === 'requests' ? Colors.primary : '#718096'}
              strokeWidth={activeTab === 'requests' ? 2.3 : 1.8}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.tabTextActive,
              ]}
            >
              Requests
            </Text>
            {pendingCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Tab Content ── */}
      {activeTab === 'requests' ? (
        /* Requests Tab */
        loadingReqs && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading requests…</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            contentContainerStyle={
              requests.length === 0 ? styles.emptyBox : styles.listContent
            }
            renderItem={({ item }) => {
              const name =
                [item.fromUser?.firstName, item.fromUser?.lastName]
                  .filter(Boolean)
                  .join(' ') ||
                item.fromUser?.name ||
                'Fan'
              const username = item.fromUser?.username || 'member'
              const isActing = actingId === item.id
              const timeStr = item.createdAt
                ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                : ''

              return (
                <View style={styles.requestCard}>
                  {/* Top user row */}
                  <View style={styles.reqTopRow}>
                    <View style={styles.avatarWrap}>
                      {item.fromUser?.image ? (
                        <Image
                          source={{ uri: item.fromUser.image }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarInitial}>
                            {name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.fanName} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.fanHandle}>@{username}</Text>
                    </View>

                    <Text style={styles.reqTime}>{timeStr}</Text>
                  </View>

                  {/* Message body */}
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{item.message}</Text>
                  </View>

                  {/* Action buttons (Accept / Decline) */}
                  <View style={styles.reqActions}>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => declineMutation.mutate(item.id)}
                      disabled={isActing}
                      activeOpacity={0.8}
                    >
                      <X size={15} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => acceptMutation.mutate(item.id)}
                      disabled={isActing}
                      activeOpacity={0.85}
                    >
                      {isActing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <CheckCircle2
                            size={15}
                            color="#FFFFFF"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.acceptBtnText}>Accept & Chat</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <Mail size={36} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No pending requests</Text>
                <Text style={styles.emptySub}>
                  When fans who follow you send message requests, they will appear here for you to accept.
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        /* Conversations Tab */
        loadingConvs && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading conversations…</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            contentContainerStyle={
              conversations.length === 0 ? styles.emptyBox : styles.listContent
            }
            renderItem={({ item }) => {
              const other = item.subscriber || item.otherUser
              const name =
                [other?.firstName, other?.lastName].filter(Boolean).join(' ') ||
                other?.name ||
                'Fan'
              const lastMsg =
                item.messages?.[0]?.content || item.lastMessageText || 'Direct message'
              const timeStr = item.lastMessageAt
                ? formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true })
                : ''

              return (
                <TouchableOpacity
                  style={styles.convCard}
                  onPress={() =>
                    router.push({
                      pathname: '/(fan)/messages/[conversationId]',
                      params: { conversationId: item.id },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarWrap}>
                    {other?.image ? (
                      <Image source={{ uri: other.image }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitial}>
                          {name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.convTop}>
                      <Text style={styles.fanName} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.reqTime}>{timeStr}</Text>
                    </View>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {lastMsg}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <MessageCircle size={36} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySub}>
                  Direct messages and interactions with your subscribers will appear here.
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 12,
    padding: 3.5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  tabTextActive: {
    color: '#1A202C',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: Radius.full,
    marginLeft: 2,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  /* Request Card */
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAE5DE',
    ...Shadows.sm,
  },
  reqTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrap: {
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F1EC',
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  fanName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  fanHandle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 1,
  },
  reqTime: {
    fontSize: 11.5,
    color: '#A0AEC0',
  },
  messageBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
  },
  reqActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Conversation Card */
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAE5DE',
    ...Shadows.sm,
  },
  convTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lastMsg: {
    fontSize: 13,
    color: '#64748B',
  },
  /* Empty States */
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13.5,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
  },
})

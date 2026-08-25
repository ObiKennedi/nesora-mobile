// app/(fan)/messages/index.tsx — Fan Direct Messages & Sent Requests matching NESORA design system
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
  StatusBar,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  MessageCircle,
  Mail,
  Plus,
  SquarePen,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'
import { NewMessageModal } from '@/components/messages/NewMessageModal'

type TabType = 'conversations' | 'requests'

export type SentRequest = {
  id: string
  message: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
  toCreator: {
    id: string
    displayName: string
    handle: string | null
    user?: {
      image: string | null
    }
  }
}

export default function FanMessagesScreen() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('conversations')
  const [modalVisible, setModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 1. Fetch Conversations
  const {
    data: convData,
    isLoading: loadingConvs,
    refetch: refetchConvs,
  } = useQuery({
    queryKey: ['fanConversations'],
    queryFn: async () => {
      const res = await api.get('/messages')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  // 2. Fetch Sent Message Requests
  const {
    data: reqData,
    isLoading: loadingReqs,
    refetch: refetchReqs,
  } = useQuery<SentRequest[]>({
    queryKey: ['fanSentRequests'],
    queryFn: async () => {
      try {
        const res = await api.get('/messages/requests/my')
        return Array.isArray(res.data) ? res.data : []
      } catch {
        return []
      }
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchConvs(), refetchReqs()])
    setRefreshing(false)
  }, [refetchConvs, refetchReqs])

  const handleOpenConversation = (conversationId: string, title?: string) => {
    router.push({
      pathname: '/(fan)/messages/[conversationId]',
      params: {
        conversationId,
        title: title || 'Chat',
      },
    })
  }

  const conversations = convData ?? []
  const requests = reqData ?? []
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.75}
        >
          <SquarePen size={18} color="#1A202C" />
        </TouchableOpacity>
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
              size={15}
              color={activeTab === 'conversations' ? Colors.primary : '#64748B'}
              strokeWidth={activeTab === 'conversations' ? 2.3 : 1.8}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'conversations' && styles.tabTextActive,
              ]}
            >
              Conversations ({conversations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
            activeOpacity={0.8}
          >
            <Mail
              size={15}
              color={activeTab === 'requests' ? Colors.primary : '#64748B'}
              strokeWidth={activeTab === 'requests' ? 2.3 : 1.8}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.tabTextActive,
              ]}
            >
              Requests ({requests.length})
            </Text>
            {pendingRequestsCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{pendingRequestsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Tab View ── */}
      {activeTab === 'conversations' ? (
        /* 1. Conversations List */
        loadingConvs && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item: any) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            contentContainerStyle={
              conversations.length === 0 ? styles.emptyContainer : styles.listContent
            }
            renderItem={({ item }: any) => {
              const other = item.creator || item.otherUser || item.subscriber
              const name =
                other?.displayName ||
                [other?.firstName, other?.lastName].filter(Boolean).join(' ') ||
                'Creator'
              const imgUrl = other?.user?.image || other?.image
              const lastMsg =
                item.messages?.[0]?.content || item.lastMessageText || 'No messages yet'
              const timeStr = item.lastMessageAt
                ? formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true })
                : ''

              return (
                <TouchableOpacity
                  style={styles.convCard}
                  onPress={() => handleOpenConversation(item.id, name)}
                  activeOpacity={0.75}
                >
                  <View style={styles.avatarWrap}>
                    {imgUrl ? (
                      <Image source={{ uri: imgUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitial}>
                          {name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.convInfo}>
                    <View style={styles.convTopRow}>
                      <Text style={styles.convName} numberOfLines={1}>
                        {name}
                      </Text>
                      {timeStr ? <Text style={styles.convTime}>{timeStr}</Text> : null}
                    </View>
                    <Text style={styles.convPreview} numberOfLines={1}>
                      {lastMsg}
                    </Text>
                  </View>

                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <Mail size={32} color={Colors.textMuted} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySub}>
                  Send a message request to start chatting with your favorite creators.
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
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        /* 2. Sent Requests List */
        loadingReqs && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary} size="large" />
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
              requests.length === 0 ? styles.emptyContainer : styles.listContent
            }
            renderItem={({ item }) => {
              const name = item.toCreator?.displayName || 'Creator'
              const imgUrl = item.toCreator?.user?.image
              const isPending = item.status === 'PENDING'
              const isAccepted = item.status === 'ACCEPTED'
              const timeStr = item.createdAt
                ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                : ''

              return (
                <View style={styles.reqCard}>
                  <View style={styles.reqTopRow}>
                    <View style={styles.avatarWrap}>
                      {imgUrl ? (
                        <Image source={{ uri: imgUrl }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarInitial}>
                            {name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.convName} numberOfLines={1}>
                        {name}
                      </Text>
                      {item.toCreator?.handle && (
                        <Text style={styles.reqHandle}>@{item.toCreator.handle}</Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        isPending
                          ? styles.statusPillPending
                          : isAccepted
                          ? styles.statusPillAccepted
                          : styles.statusPillDeclined,
                      ]}
                    >
                      {isPending ? (
                        <Clock size={11} color="#D97706" />
                      ) : isAccepted ? (
                        <CheckCircle2 size={11} color="#10B981" />
                      ) : (
                        <XCircle size={11} color="#EF4444" />
                      )}
                      <Text
                        style={[
                          styles.statusPillText,
                          isPending
                            ? styles.statusTextPending
                            : isAccepted
                            ? styles.statusTextAccepted
                            : styles.statusTextDeclined,
                        ]}
                      >
                        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Message Bubble */}
                  <View style={styles.reqMessageBox}>
                    <Text style={styles.reqMessageText}>{item.message}</Text>
                    <Text style={styles.reqTimestamp}>{timeStr}</Text>
                  </View>
                </View>
              )
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <Clock size={32} color={Colors.textMuted} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No sent requests</Text>
                <Text style={styles.emptySub}>
                  When you send a message request to a creator you follow, its status will show here.
                </Text>

                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                  <Text style={styles.emptyActionBtnText}>Send a Request</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  newChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: Radius.full,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  /* Conversation Row */
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Shadows.sm,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
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
  convInfo: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  convName: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  convTime: {
    color: '#94A3B8',
    fontSize: 11.5,
  },
  convPreview: {
    color: '#64748B',
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  /* Request Card */
  reqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  reqTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  reqHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: Radius.full,
    gap: 4,
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusPillDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextAccepted: {
    color: '#10B981',
  },
  statusTextDeclined: {
    color: '#EF4444',
  },
  reqMessageBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reqMessageText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
  },
  reqTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'right',
  },
  /* Empty States */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 280,
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

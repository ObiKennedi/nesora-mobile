// app/(creator)/messages/index.tsx — Creator Direct Messages matching screenshot design
import React, { useState, useMemo } from 'react'
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
  Menu,
  Bell,
  MessageCircle,
  Mail,
  CheckCircle2,
  X,
  UserCheck,
  Sparkles,
  Clock,
  Star,
  Users,
  MessageSquare,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { SideDrawer } from '@/components/navigation/SideDrawer'
import { Colors, Radius, Shadows } from '@/constants/theme'

type TabType = 'all' | 'subscribers' | 'fans' | 'requests'

export default function CreatorMessagesScreen() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
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

  const allConversations = convData ?? []
  const requests = reqData ?? []
  const pendingCount = requests.length

  const filteredConversations = useMemo(() => {
    if (activeTab === 'subscribers') {
      return allConversations.filter((c: any) => c.isSubscribed || c.subscriber?.isSubscribed)
    }
    if (activeTab === 'fans') {
      return allConversations.filter((c: any) => !c.isSubscribed && !c.subscriber?.isSubscribed)
    }
    return allConversations
  }, [allConversations, activeTab])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header (Hamburger, Messages, Bell, Avatar) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Menu size={22} color="#1A202C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Messages</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(fan)/notifications' as any)}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#1A202C" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.8}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(user?.name || 'C')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sub-Header Filter Pills (All, Subscribers, Fans, Requests) ── */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          {/* 1. All */}
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <MessageCircle
              size={14}
              color={activeTab === 'all' ? '#EA580C' : '#64748B'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'all' && styles.tabPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* 2. Subscribers */}
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'subscribers' && styles.tabPillActive]}
            onPress={() => setActiveTab('subscribers')}
            activeOpacity={0.8}
          >
            <Star
              size={13}
              color={activeTab === 'subscribers' ? '#EA580C' : '#64748B'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'subscribers' && styles.tabPillTextActive,
              ]}
            >
              Subscribers
            </Text>
          </TouchableOpacity>

          {/* 3. Fans */}
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'fans' && styles.tabPillActive]}
            onPress={() => setActiveTab('fans')}
            activeOpacity={0.8}
          >
            <Users
              size={13}
              color={activeTab === 'fans' ? '#EA580C' : '#64748B'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'fans' && styles.tabPillTextActive,
              ]}
            >
              Fans
            </Text>
          </TouchableOpacity>

          {/* 4. Requests */}
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'requests' && styles.tabPillActive]}
            onPress={() => setActiveTab('requests')}
            activeOpacity={0.8}
          >
            <Mail
              size={13}
              color={activeTab === 'requests' ? '#EA580C' : '#64748B'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'requests' && styles.tabPillTextActive,
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

      {/* ── Main Content ── */}
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

                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{item.message}</Text>
                  </View>

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
        /* Conversations List */
        loadingConvs && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading conversations…</Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
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
              filteredConversations.length === 0 ? styles.emptyBox : styles.listContent
            }
            renderItem={({ item }) => {
              const other = item.subscriber || item.otherUser || item.creator
              const name =
                other?.displayName ||
                [other?.firstName, other?.lastName].filter(Boolean).join(' ') ||
                other?.name ||
                other?.username ||
                'Fan'
              const imgUrl = other?.image || other?.user?.image
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
                <Text style={styles.emptyTopLabel}>No conversations yet</Text>
                <Text style={styles.emptyTopSub}>Messages from fans will appear here</Text>

                <View style={styles.emptyCenterCard}>
                  <View style={styles.emptySpeechBubble}>
                    <MessageSquare size={38} color="#CBD5E1" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptySelectTitle}>Select a conversation</Text>
                  <Text style={styles.emptySelectSub}>
                    Choose a conversation from the sidebar to start messaging.
                  </Text>
                </View>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* ── Side Navigation Drawer ── */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarBtn: {
    position: 'relative',
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  headerAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  /* Tab Container */
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    gap: 5,
  },
  tabPillActive: {
    backgroundColor: '#FFF7ED',
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 9.5,
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
  convTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  lastMsg: {
    fontSize: 13,
    color: '#64748B',
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
  /* Empty States matching screenshot */
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  emptyWrap: {
    alignItems: 'center',
    width: '100%',
  },
  emptyTopLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptyTopSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 80,
  },
  emptyCenterCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptySpeechBubble: {
    marginBottom: 16,
  },
  emptySelectTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySelectSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
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

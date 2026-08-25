// components/messages/NewMessageModal.tsx — New Message & Request modal for fans
import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native'
import {
  X,
  Search,
  MessageCircle,
  Send,
  Crown,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  ArrowLeft,
  Sparkles,
  Compass,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

export type FollowedCreatorItem = {
  creator: {
    id: string
    displayName: string
    handle: string | null
    user?: {
      image: string | null
    }
  }
  isSubscribed: boolean
  subscription?: {
    planName?: string | null
    planPrice?: number | null
    interval?: string | null
  } | null
  conversationId?: string | null
  hasPendingRequest?: boolean
}

export type SentRequestItem = {
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

interface NewMessageModalProps {
  visible: boolean
  onClose: () => void
  onOpenConversation: (conversationId: string, title?: string) => void
}

export function NewMessageModal({
  visible,
  onClose,
  onOpenConversation,
}: NewMessageModalProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'creators' | 'requests'>('creators')
  const [composingFor, setComposingFor] = useState<FollowedCreatorItem | null>(null)
  const [composeText, setComposeText] = useState('')
  const [startingCreatorId, setStartingCreatorId] = useState<string | null>(null)
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Fetch followed / subscribed creators
  const {
    data: followedCreators,
    isLoading: loadingCreators,
    refetch: refetchCreators,
  } = useQuery<FollowedCreatorItem[]>({
    queryKey: ['fanFollowedCreators'],
    queryFn: async () => {
      try {
        const res = await api.get('/messages/followed-creators')
        return res.data ?? []
      } catch {
        // Fallback: fetch discover or subscriptions if followed-creators isn't seeded
        try {
          const res = await api.get('/subscription/my')
          const subs = res.data ?? []
          return subs.map((s: any) => ({
            creator: s.creator,
            isSubscribed: true,
            subscription: { planName: 'Subscriber' },
            conversationId: null,
            hasPendingRequest: false,
          }))
        } catch {
          return []
        }
      }
    },
    enabled: visible,
  })

  // Fetch sent requests
  const {
    data: sentRequests,
    isLoading: loadingRequests,
    refetch: refetchRequests,
  } = useQuery<SentRequestItem[]>({
    queryKey: ['fanSentRequests'],
    queryFn: async () => {
      try {
        const res = await api.get('/messages/requests/my')
        return res.data ?? []
      } catch {
        return []
      }
    },
    enabled: visible,
  })

  // Start direct conversation mutation (for subscribers)
  const startConversation = useMutation({
    mutationFn: async (creatorId: string) => {
      const res = await api.post('/messages/start', { creatorId })
      return res.data
    },
    onSuccess: (data, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['fanFollowedCreators'] })
      if (data?.conversationId) {
        const target = followedCreators?.find((f) => f.creator.id === creatorId)
        onClose()
        onOpenConversation(data.conversationId, target?.creator.displayName)
      }
    },
    onError: (err: any) => {
      Alert.alert(
        'Unable to Start Chat',
        err?.response?.data?.error || err?.response?.data?.message || 'Please make sure your subscription is active.',
      )
    },
    onSettled: () => {
      setStartingCreatorId(null)
    },
  })

  // Send message request mutation (for followers)
  const sendRequest = useMutation({
    mutationFn: async ({ creatorId, message }: { creatorId: string; message: string }) => {
      const res = await api.post('/messages/request', { creatorId, message })
      return res.data
    },
    onSuccess: () => {
      setRequestSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['fanFollowedCreators'] })
      queryClient.invalidateQueries({ queryKey: ['fanSentRequests'] })
      refetchCreators()
      refetchRequests()
    },
    onError: (err: any) => {
      Alert.alert(
        'Request Error',
        err?.response?.data?.error || err?.response?.data?.message || 'Could not send message request.',
      )
    },
  })

  const handleMessageDirect = (item: FollowedCreatorItem) => {
    if (item.conversationId) {
      onClose()
      onOpenConversation(item.conversationId, item.creator.displayName)
      return
    }
    setStartingCreatorId(item.creator.id)
    startConversation.mutate(item.creator.id)
  }

  const handleSendRequestSubmit = () => {
    if (!composingFor || !composeText.trim()) return
    sendRequest.mutate({
      creatorId: composingFor.creator.id,
      message: composeText.trim(),
    })
  }

  const filteredCreators = useMemo(() => {
    if (!followedCreators) return []
    if (!search.trim()) return followedCreators
    const q = search.toLowerCase()
    return followedCreators.filter(
      (f) =>
        f.creator.displayName?.toLowerCase().includes(q) ||
        f.creator.handle?.toLowerCase().includes(q),
    )
  }, [followedCreators, search])

  const subscribedList = useMemo(
    () => filteredCreators.filter((c) => c.isSubscribed),
    [filteredCreators],
  )
  const followingList = useMemo(
    () => filteredCreators.filter((c) => !c.isSubscribed),
    [filteredCreators],
  )

  const resetModalState = () => {
    setComposingFor(null)
    setComposeText('')
    setRequestSuccess(false)
    setSearch('')
  }

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          {composingFor ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setComposingFor(null)
                setComposeText('')
                setRequestSuccess(false)
              }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}

          <Text style={styles.headerTitle}>
            {composingFor ? 'Message Request' : 'New Message'}
          </Text>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Compose Request View ── */}
        {composingFor ? (
          <ScrollView
            contentContainerStyle={styles.composeContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.composeHeader}>
              {composingFor.creator.user?.image ? (
                <Image
                  source={{ uri: composingFor.creator.user.image }}
                  style={styles.composeAvatar}
                />
              ) : (
                <View style={styles.composeAvatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {composingFor.creator.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.composeCreatorInfo}>
                <Text style={styles.composeCreatorName}>
                  {composingFor.creator.displayName}
                </Text>
                {composingFor.creator.handle && (
                  <Text style={styles.composeCreatorHandle}>
                    @{composingFor.creator.handle}
                  </Text>
                )}
              </View>
            </View>

            {requestSuccess ? (
              <View style={styles.successBox}>
                <CheckCircle2 size={44} color="#10B981" />
                <Text style={styles.successTitle}>Request Sent!</Text>
                <Text style={styles.successSub}>
                  You will be notified as soon as {composingFor.creator.displayName} accepts your message request.
                </Text>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => {
                    resetModalState()
                    setActiveTab('requests')
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneBtnText}>View Requests</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formWrap}>
                <Text style={styles.formHint}>
                  Send a message request to introduce yourself. Once accepted, you can chat directly.
                </Text>

                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Write your message to this creator..."
                    placeholderTextColor={Colors.textMuted}
                    value={composeText}
                    onChangeText={setComposeText}
                    multiline
                    maxLength={500}
                    autoFocus
                  />
                  <Text style={styles.charCount}>
                    {composeText.length}/500
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!composeText.trim() || sendRequest.isPending) &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleSendRequestSubmit}
                  disabled={!composeText.trim() || sendRequest.isPending}
                  activeOpacity={0.8}
                >
                  {sendRequest.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Send size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.submitBtnText}>Send Message Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          /* ── Main List View ── */
          <View style={styles.mainContainer}>
            {/* Search Input */}
            <View style={styles.searchBar}>
              <Search size={17} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search creators you follow..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Segmented Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'creators' && styles.tabItemActive,
                ]}
                onPress={() => setActiveTab('creators')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'creators' && styles.tabLabelActive,
                  ]}
                >
                  Creators ({filteredCreators.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'requests' && styles.tabItemActive,
                ]}
                onPress={() => setActiveTab('requests')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'requests' && styles.tabLabelActive,
                  ]}
                >
                  Sent Requests ({sentRequests?.length ?? 0})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content List */}
            {activeTab === 'creators' ? (
              loadingCreators ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : filteredCreators.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Compass size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>
                    {search ? 'No creators found' : 'Not following any creators yet'}
                  </Text>
                  <Text style={styles.emptySub}>
                    {search
                      ? `No followed creators match "${search}".`
                      : 'Follow or subscribe to creators from Explore to message them.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.exploreBtn}
                    onPress={() => {
                      handleClose()
                      router.push('/(fan)/discover' as any)
                    }}
                    activeOpacity={0.8}
                  >
                    <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.exploreBtnText}>Explore Creators</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  style={styles.scrollList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 30 }}
                >
                  {/* 1. Subscribed Creators Group */}
                  {subscribedList.length > 0 && (
                    <View style={styles.groupSection}>
                      <View style={styles.groupHeader}>
                        <Crown size={14} color="#D97706" />
                        <Text style={styles.groupHeaderText}>
                          Subscriptions — Direct Message
                        </Text>
                      </View>
                      {subscribedList.map((item) => (
                        <View key={item.creator.id} style={styles.creatorCard}>
                          <View style={styles.creatorLeft}>
                            {item.creator.user?.image ? (
                              <Image
                                source={{ uri: item.creator.user.image }}
                                style={styles.avatar}
                              />
                            ) : (
                              <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitial}>
                                  {item.creator.displayName.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                            )}
                            <View style={styles.creatorDetails}>
                              <Text style={styles.creatorName} numberOfLines={1}>
                                {item.creator.displayName}
                              </Text>
                              {item.creator.handle && (
                                <Text style={styles.creatorHandle} numberOfLines={1}>
                                  @{item.creator.handle}
                                </Text>
                              )}
                              <View style={styles.subscriberPill}>
                                <Crown size={10} color="#D97706" />
                                <Text style={styles.subscriberPillText}>
                                  {item.subscription?.planName || 'Subscriber'}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={[
                              styles.actionBtn,
                              styles.actionBtnPrimary,
                              startingCreatorId === item.creator.id && styles.actionBtnDisabled,
                            ]}
                            onPress={() => handleMessageDirect(item)}
                            disabled={startingCreatorId === item.creator.id}
                            activeOpacity={0.7}
                          >
                            {startingCreatorId === item.creator.id ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <MessageCircle size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.actionBtnPrimaryText}>
                                  {item.conversationId ? 'Open' : 'Message'}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 2. Following Only Group */}
                  {followingList.length > 0 && (
                    <View style={styles.groupSection}>
                      <View style={styles.groupHeader}>
                        <User size={14} color={Colors.textSecondary} />
                        <Text style={styles.groupHeaderText}>
                          Following — Message Request
                        </Text>
                      </View>
                      {followingList.map((item) => (
                        <View key={item.creator.id} style={styles.creatorCard}>
                          <View style={styles.creatorLeft}>
                            {item.creator.user?.image ? (
                              <Image
                                source={{ uri: item.creator.user.image }}
                                style={styles.avatar}
                              />
                            ) : (
                              <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitial}>
                                  {item.creator.displayName.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                            )}
                            <View style={styles.creatorDetails}>
                              <Text style={styles.creatorName} numberOfLines={1}>
                                {item.creator.displayName}
                              </Text>
                              {item.creator.handle && (
                                <Text style={styles.creatorHandle} numberOfLines={1}>
                                  @{item.creator.handle}
                                </Text>
                              )}
                            </View>
                          </View>

                          {item.hasPendingRequest ? (
                            <View style={styles.pendingBadge}>
                              <Clock size={12} color="#D97706" />
                              <Text style={styles.pendingBadgeText}>Pending</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.actionBtnOutline]}
                              onPress={() => {
                                setComposingFor(item)
                                setComposeText('')
                                setRequestSuccess(false)
                              }}
                              activeOpacity={0.7}
                            >
                              <Send size={13} color={Colors.primary} style={{ marginRight: 4 }} />
                              <Text style={styles.actionBtnOutlineText}>Request</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
              )
            ) : (
              /* Sent Requests Tab */
              loadingRequests ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : !sentRequests || sentRequests.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Clock size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>No sent requests</Text>
                  <Text style={styles.emptySub}>
                    When you send a message request to a creator you follow, its status will show here.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={sentRequests}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
                  renderItem={({ item }) => {
                    const isPending = item.status === 'PENDING'
                    const isAccepted = item.status === 'ACCEPTED'

                    return (
                      <View style={styles.requestCard}>
                        <View style={styles.requestCardHeader}>
                          <View style={styles.requestCreatorRow}>
                            {item.toCreator?.user?.image ? (
                              <Image
                                source={{ uri: item.toCreator.user.image }}
                                style={styles.requestAvatar}
                              />
                            ) : (
                              <View style={styles.requestAvatarFallback}>
                                <Text style={styles.avatarInitialSmall}>
                                  {(item.toCreator?.displayName || 'C')[0].toUpperCase()}
                                </Text>
                              </View>
                            )}
                            <View style={{ marginLeft: 10 }}>
                              <Text style={styles.requestCreatorName}>
                                {item.toCreator?.displayName || 'Creator'}
                              </Text>
                              {item.toCreator?.handle && (
                                <Text style={styles.requestCreatorHandle}>
                                  @{item.toCreator.handle}
                                </Text>
                              )}
                            </View>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              isPending
                                ? styles.statusBadgePending
                                : isAccepted
                                ? styles.statusBadgeAccepted
                                : styles.statusBadgeDeclined,
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
                                styles.statusBadgeText,
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

                        <Text style={styles.requestMessage} numberOfLines={3}>
                          {item.message}
                        </Text>
                      </View>
                    )
                  }}
                />
              )
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  groupSection: {
    marginBottom: 18,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  creatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  creatorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  creatorHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  subscriberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  subscriberPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFF7ED',
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Compose Styles */
  composeContainer: {
    padding: 20,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  composeAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  composeAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeCreatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  composeCreatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  composeCreatorHandle: {
    fontSize: 13,
    color: '#64748B',
  },
  formWrap: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formHint: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  inputCard: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    padding: 12,
    backgroundColor: '#F8FAFC',
    minHeight: 120,
    marginBottom: 16,
  },
  textArea: {
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: Radius.full,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Request list items */
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    ...Shadows.sm,
  },
  requestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  requestAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  requestAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  requestCreatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  requestCreatorHandle: {
    fontSize: 11,
    color: '#64748B',
  },
  requestMessage: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: Radius.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextAccepted: {
    color: '#065F46',
  },
  statusTextDeclined: {
    color: '#991B1B',
  },
})

// app/(creator)/audience/index.tsx — Creator Audience Management (Fans, Subscribers, Top Fans & Subscription Plans)
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native'
import {
  Menu,
  Bell,
  Users,
  UserCheck,
  Crown,
  Star,
  Sparkles,
  MessageCircle,
  Phone,
  Gift,
  Search,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
  Check,
  Layers,
  Edit3,
  Trash2,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { SideDrawer } from '@/components/navigation/SideDrawer'
import { Colors, Radius, Shadows } from '@/constants/theme'

type TabType = 'subscribers' | 'plans' | 'fans' | 'top_fans'

const DEFAULT_BENEFIT_PRESETS = [
  'Exclusive posts & private media',
  'Direct 1-on-1 VIP messaging',
  'Free monthly voice/video call',
  'Early access to new content',
  'Subscriber-only live streams',
  'Custom VIP badge on comments',
]

const PRICE_PRESETS = [
  { label: '₦2,500/mo', val: 2500 },
  { label: '₦5,000/mo', val: 5000 },
  { label: '₦10,000/mo', val: 10000 },
  { label: '₦20,000/mo', val: 20000 },
]

export default function CreatorAudienceScreen() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('subscribers')
  const [refreshing, setRefreshing] = useState(false)

  // Plan modal states
  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [planName, setPlanName] = useState('')
  const [planPrice, setPlanPrice] = useState('5000')
  const [planDescription, setPlanDescription] = useState('')
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    DEFAULT_BENEFIT_PRESETS[0],
    DEFAULT_BENEFIT_PRESETS[1],
  ])
  const [customBenefit, setCustomBenefit] = useState('')

  // 1. Fetch Audience Data
  const { data: audienceData, isLoading: loadingAudience, refetch: refetchAudience } = useQuery({
    queryKey: ['creatorAudienceData'],
    queryFn: async () => {
      const res = await api.get('/creators/creator/audience')
      return res.data
    },
  })

  // 2. Fetch Creator Subscription Plans
  const { data: plansData, isLoading: loadingPlans, refetch: refetchPlans } = useQuery({
    queryKey: ['creatorSubscriptionPlans'],
    queryFn: async () => {
      const res = await api.get('/subscription/creator/plans')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchAudience(), refetchPlans()])
    setRefreshing(false)
  }, [refetchAudience, refetchPlans])

  // Create or Update Plan Mutation
  const savePlanMutation = useMutation({
    mutationFn: async () => {
      const numPrice = Number(planPrice.replace(/[^0-9]/g, ''))
      if (!planName.trim()) throw new Error('Please enter a tier name.')
      if (numPrice < 500) throw new Error('Minimum tier price is ₦500.')

      const payload = {
        name: planName.trim(),
        price: numPrice,
        description: planDescription.trim(),
        benefits: selectedBenefits,
        interval: 'monthly' as const,
      }

      if (editingPlanId) {
        const res = await api.post(`/subscription/creator/plans/${editingPlanId}/update`, payload)
        return res.data
      } else {
        const res = await api.post('/subscription/creator/plans', payload)
        return res.data
      }
    },
    onSuccess: (data) => {
      if (data?.error) {
        Alert.alert('Notice', data.error)
        return
      }
      setPlanModalVisible(false)
      resetPlanForm()
      queryClient.invalidateQueries({ queryKey: ['creatorSubscriptionPlans'] })
      refetchPlans()
      Alert.alert(
        editingPlanId ? 'Plan Updated' : 'Plan Created! 🎉',
        'Your subscription tier is live for fans to subscribe.',
      )
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Could not save plan.')
    },
  })

  // Toggle Plan Status Mutation
  const togglePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await api.post(`/subscription/creator/plans/${planId}/toggle`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorSubscriptionPlans'] })
      refetchPlans()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not toggle plan status.')
    },
  })

  // Delete Plan Mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await api.post(`/subscription/creator/plans/${planId}/delete`)
      return res.data
    },
    onSuccess: (data) => {
      if (data?.error) {
        Alert.alert('Cannot Delete', data.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: ['creatorSubscriptionPlans'] })
      refetchPlans()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not delete plan.')
    },
  })

  const resetPlanForm = () => {
    setEditingPlanId(null)
    setPlanName('')
    setPlanPrice('5000')
    setPlanDescription('')
    setSelectedBenefits([DEFAULT_BENEFIT_PRESETS[0], DEFAULT_BENEFIT_PRESETS[1]])
    setCustomBenefit('')
  }

  const handleOpenCreatePlan = () => {
    resetPlanForm()
    setPlanModalVisible(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id)
    setPlanName(plan.name)
    setPlanPrice((plan.price ?? 5000).toString())
    setPlanDescription(plan.description ?? '')
    setSelectedBenefits(Array.isArray(plan.benefits) ? plan.benefits : [DEFAULT_BENEFIT_PRESETS[0]])
    setPlanModalVisible(true)
  }

  const toggleBenefit = (b: string) => {
    if (selectedBenefits.includes(b)) {
      setSelectedBenefits(selectedBenefits.filter((item) => item !== b))
    } else {
      setSelectedBenefits([...selectedBenefits, b])
    }
  }

  const addCustomBenefit = () => {
    if (customBenefit.trim() && !selectedBenefits.includes(customBenefit.trim())) {
      setSelectedBenefits([...selectedBenefits, customBenefit.trim()])
      setCustomBenefit('')
    }
  }

  const stats = audienceData?.stats ?? { followersCount: 0, subscribersCount: 0, topFansCount: 0 }
  const subscribers = audienceData?.subscribers ?? []
  const followers = audienceData?.followers ?? []
  const topFans = audienceData?.topFans ?? []
  const plans = plansData ?? []

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Menu size={22} color="#1A202C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Audience</Text>

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

      {/* ── Audience Stats Summary ── */}
      <View style={styles.statsSummary}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxNum}>{stats.followersCount}</Text>
          <Text style={styles.statBoxLabel}>Total Fans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statBoxNum, { color: '#059669' }]}>
            {stats.subscribersCount}
          </Text>
          <Text style={styles.statBoxLabel}>Subscribers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statBoxNum, { color: '#D97706' }]}>
            {stats.topFansCount}
          </Text>
          <Text style={styles.statBoxLabel}>Top Supporters</Text>
        </View>
      </View>

      {/* ── Segmented Tabs: Subscribers | Plans | Fans | Top Fans ── */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {/* 1. Subscribers */}
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
              Subscribers ({subscribers.length})
            </Text>
          </TouchableOpacity>

          {/* 2. Subscription Plans */}
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'plans' && styles.tabPillActive]}
            onPress={() => setActiveTab('plans')}
            activeOpacity={0.8}
          >
            <Layers
              size={13}
              color={activeTab === 'plans' ? '#EA580C' : '#64748B'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'plans' && styles.tabPillTextActive,
              ]}
            >
              My Plans ({plans.length})
            </Text>
          </TouchableOpacity>

          {/* 3. Fans (Followers) */}
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
              Fans ({followers.length})
            </Text>
          </TouchableOpacity>

          {/* 4. Top Fans */}
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'top_fans' && styles.tabPillActive]}
            onPress={() => setActiveTab('top_fans')}
            activeOpacity={0.8}
          >
            <Crown
              size={13}
              color={activeTab === 'top_fans' ? '#EA580C' : '#64748B'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'top_fans' && styles.tabPillTextActive,
              ]}
            >
              Top Fans ({topFans.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Main List Content ── */}
      {activeTab === 'plans' ? (
        /* Plans Manager Tab */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Create Plan CTA */}
          <TouchableOpacity
            style={styles.createPlanBtn}
            onPress={handleOpenCreatePlan}
            activeOpacity={0.85}
          >
            <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.createPlanBtnText}>Create Subscription Tier</Text>
          </TouchableOpacity>

          {loadingPlans && !refreshing ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
          ) : plans.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconBox}>
                <Layers size={32} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No subscription tiers yet</Text>
              <Text style={styles.emptySub}>
                Create monthly membership tiers (e.g. VIP Tier, Gold Club) with exclusive benefits for your paying fans.
              </Text>
            </View>
          ) : (
            plans.map((plan: any) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.planTitleRow}>
                      <Text style={styles.planNameText}>{plan.name}</Text>
                      <View
                        style={[
                          styles.planStatusBadge,
                          plan.isActive ? styles.badgeActive : styles.badgePaused,
                        ]}
                      >
                        <Text
                          style={[
                            styles.planStatusText,
                            plan.isActive ? styles.textActive : styles.textPaused,
                          ]}
                        >
                          {plan.isActive ? 'Active' : 'Paused'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.planPriceText}>
                      ₦{(plan.price ?? 0).toLocaleString()} / {plan.interval || 'month'}
                    </Text>
                    {plan.description ? (
                      <Text style={styles.planDescText}>{plan.description}</Text>
                    ) : null}
                  </View>

                  <View style={styles.planActions}>
                    <TouchableOpacity
                      style={styles.planIconAction}
                      onPress={() => handleEditPlan(plan)}
                    >
                      <Edit3 size={15} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.planIconAction}
                      onPress={() =>
                        Alert.alert('Delete Tier', `Are you sure you want to delete ${plan.name}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => deletePlanMutation.mutate(plan.id),
                          },
                        ])
                      }
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Benefits List */}
                <View style={styles.benefitsBox}>
                  {(plan.benefits || []).map((b: string, i: number) => (
                    <View key={i} style={styles.benefitItem}>
                      <Check size={12} color="#059669" />
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer info */}
                <View style={styles.planFooterRow}>
                  <Text style={styles.planSubscribersCount}>
                    👥 {plan.activeSubscribersCount ?? 0} active subscriber(s)
                  </Text>
                  <Switch
                    value={plan.isActive}
                    onValueChange={() => togglePlanMutation.mutate(plan.id)}
                    trackColor={{ false: '#CBD5E1', true: '#059669' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* Subscribers, Fans, Top Fans Lists */
        <FlatList
          data={
            activeTab === 'subscribers'
              ? subscribers
              : activeTab === 'fans'
              ? followers
              : topFans
          }
          keyExtractor={(item: any, idx) => item.id || item.user?.id || `item-${idx}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }: any) => {
            const u = item.user || item
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(' ') ||
              u.name ||
              u.username ||
              'Fan Member'
            const username = u.username || 'member'
            const imgUrl = u.image

            if (activeTab === 'top_fans') {
              const rank = item.rank || index + 1
              const isFirst = rank === 1
              const isSecond = rank === 2
              const isThird = rank === 3

              return (
                <View style={[styles.audienceCard, isFirst && styles.topFanRank1Card]}>
                  <View
                    style={[
                      styles.rankBadge,
                      isFirst
                        ? styles.rank1Badge
                        : isSecond
                        ? styles.rank2Badge
                        : isThird
                        ? styles.rank3Badge
                        : styles.rankOtherBadge,
                    ]}
                  >
                    {isFirst ? (
                      <Crown size={12} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.rankNum}>#{rank}</Text>
                    )}
                  </View>

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
                    <View style={styles.nameRow}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {name}
                      </Text>
                      <View style={styles.topFanPill}>
                        <Sparkles size={10} color="#D97706" />
                        <Text style={styles.topFanPillText}>Top Supporter</Text>
                      </View>
                    </View>
                    <Text style={styles.userHandle}>@{username}</Text>
                    <Text style={styles.supportSpendText}>
                      Contributed ₦{(item.totalSpend ?? 0).toLocaleString()} · {item.giftCount ?? 0} gifts
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.directChatBtn}
                    onPress={() => router.push('/(creator)/messages')}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={15} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              )
            }

            if (activeTab === 'subscribers') {
              const planName = item.plan?.name || 'Active Subscriber'
              const planPrice = item.plan?.price || item.amountPaid || 0
              const expiresStr = item.expiresAt
                ? formatDistanceToNow(new Date(item.expiresAt), { addSuffix: true })
                : ''

              return (
                <View style={styles.audienceCard}>
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
                    <View style={styles.nameRow}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {name}
                      </Text>
                      <View style={styles.subscriberPill}>
                        <Star size={10} color="#059669" />
                        <Text style={styles.subscriberPillText}>{planName}</Text>
                      </View>
                    </View>
                    <Text style={styles.userHandle}>@{username}</Text>
                    <Text style={styles.subMeta}>
                      ₦{planPrice.toLocaleString()}/mo · Renews {expiresStr}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.directChatBtn}
                    onPress={() => router.push('/(creator)/messages')}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={15} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              )
            }

            // Fans (Followers)
            const followTimeStr = item.createdAt
              ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
              : ''

            return (
              <View style={styles.audienceCard}>
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
                  <Text style={styles.userName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.userHandle}>@{username}</Text>
                  <Text style={styles.subMeta}>Followed {followTimeStr}</Text>
                </View>

                <TouchableOpacity
                  style={styles.directChatBtn}
                  onPress={() => router.push('/(creator)/messages')}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={15} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconBox}>
                {activeTab === 'top_fans' ? (
                  <Crown size={32} color="#D97706" />
                ) : activeTab === 'subscribers' ? (
                  <Star size={32} color="#059669" />
                ) : (
                  <Users size={32} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'top_fans'
                  ? 'No top supporters yet'
                  : activeTab === 'subscribers'
                  ? 'No active subscribers'
                  : 'No followers yet'}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'top_fans'
                  ? 'Fans who send you gifts and tips will be ranked here.'
                  : activeTab === 'subscribers'
                  ? 'Fans who subscribe to your paid tiers will appear here.'
                  : 'Share your profile to start building your audience.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ── Plan Creator / Editor Modal ── */}
      <Modal
        visible={planModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlanModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.planModalCard}>
            <View style={styles.planModalHeader}>
              <Text style={styles.planModalTitle}>
                {editingPlanId ? 'Edit Subscription Tier' : 'New Subscription Tier'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setPlanModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tier Name */}
              <Text style={styles.formLabel}>Tier Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. VIP Club, Gold Tier"
                value={planName}
                onChangeText={setPlanName}
                placeholderTextColor="#94A3B8"
              />

              {/* Monthly Price */}
              <Text style={styles.formLabel}>Monthly Price (₦)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="5000"
                keyboardType="numeric"
                value={planPrice}
                onChangeText={setPlanPrice}
                placeholderTextColor="#94A3B8"
              />

              {/* Price Presets */}
              <View style={styles.presetsRow}>
                {PRICE_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.val}
                    style={[
                      styles.pricePresetPill,
                      Number(planPrice) === p.val && styles.pricePresetPillActive,
                    ]}
                    onPress={() => setPlanPrice(p.val.toString())}
                  >
                    <Text
                      style={[
                        styles.pricePresetText,
                        Number(planPrice) === p.val && styles.pricePresetTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={styles.formLabel}>Short Description (Optional)</Text>
              <TextInput
                style={[styles.inputField, { height: 60 }]}
                placeholder="Brief summary of what subscribers receive..."
                value={planDescription}
                onChangeText={setPlanDescription}
                placeholderTextColor="#94A3B8"
                multiline
              />

              {/* Benefits Selection */}
              <Text style={styles.formLabel}>Perks & Benefits</Text>
              <View style={styles.benefitsGrid}>
                {DEFAULT_BENEFIT_PRESETS.map((b) => {
                  const isSelected = selectedBenefits.includes(b)
                  return (
                    <TouchableOpacity
                      key={b}
                      style={[styles.benefitChip, isSelected && styles.benefitChipActive]}
                      onPress={() => toggleBenefit(b)}
                    >
                      <View
                        style={[
                          styles.benefitCheckbox,
                          isSelected && styles.benefitCheckboxActive,
                        ]}
                      >
                        {isSelected && <Check size={11} color="#FFFFFF" />}
                      </View>
                      <Text
                        style={[
                          styles.benefitChipText,
                          isSelected && styles.benefitChipTextActive,
                        ]}
                      >
                        {b}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Save CTA */}
              <TouchableOpacity
                style={styles.savePlanBtn}
                onPress={() => savePlanMutation.mutate()}
                disabled={savePlanMutation.isPending}
                activeOpacity={0.85}
              >
                {savePlanMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.savePlanBtnText}>
                    {editingPlanId ? 'Update Tier' : 'Create Tier & Publish'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#F8FAFC',
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
  /* Stats summary bar */
  statsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  /* Segmented tabs */
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  tabPillActive: {
    backgroundColor: '#FFF7ED',
  },
  tabPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  /* Plans */
  createPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 6,
    ...Shadows.sm,
  },
  createPlanBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  planNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  planStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgePaused: { backgroundColor: '#F1F5F9' },
  planStatusText: { fontSize: 10, fontWeight: '700' },
  textActive: { color: '#059669' },
  textPaused: { color: '#64748B' },
  planPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  planDescText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planIconAction: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 12,
    color: '#334155',
  },
  planFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  planSubscribersCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  /* Audience Card */
  audienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Shadows.sm,
  },
  topFanRank1Card: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFDFB',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank1Badge: { backgroundColor: '#F59E0B' },
  rank2Badge: { backgroundColor: '#94A3B8' },
  rank3Badge: { backgroundColor: '#D97706' },
  rankOtherBadge: { backgroundColor: '#F1F5F9' },
  rankNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  userHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  topFanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  topFanPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  subscriberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  subscriberPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
  supportSpendText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 3,
  },
  subMeta: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  directChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Empty States */
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  /* Plan Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  planModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  planModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  pricePresetPill: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  pricePresetPillActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  pricePresetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  pricePresetTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  benefitsGrid: {
    gap: 8,
    marginTop: 6,
    marginBottom: 20,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    gap: 10,
  },
  benefitChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  benefitCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCheckboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  benefitChipText: {
    fontSize: 13,
    color: '#334155',
  },
  benefitChipTextActive: {
    fontWeight: '600',
    color: '#065F46',
  },
  savePlanBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Shadows.sm,
  },
  savePlanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

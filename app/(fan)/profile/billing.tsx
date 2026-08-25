// app/(fan)/profile/billing.tsx — Billing, Platform Membership & Subscriptions Screen
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import {
  ArrowLeft,
  Sparkles,
  CreditCard,
  Calendar,
  ShieldCheck,
  User,
  ArrowDownLeft,
  Plus,
} from 'lucide-react-native'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { api } from '@/lib/api'
import { MembershipModal } from '@/components/membership/MembershipModal'
import { WalletModal } from '@/components/wallet/WalletModal'
import { Colors, Radius, Shadows } from '@/constants/theme'

export default function BillingScreen() {
  const [membershipModalVisible, setMembershipModalVisible] = useState(false)
  const [walletModalVisible, setWalletModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 1. Fetch Membership Status
  const { data: membershipData, isLoading: loadingMembership, refetch: refetchMembership } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await api.get('/subscription/membership/status')
      return res.data
    },
  })

  // 2. Fetch Creator Subscriptions
  const { data: subsData, isLoading: loadingSubs, refetch: refetchSubs } = useQuery({
    queryKey: ['mySubscriptions'],
    queryFn: async () => {
      const res = await api.get('/subscription/my')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  // 3. Fetch Wallet Balance & Invoices
  const { data: walletData, isLoading: loadingWallet, refetch: refetchWallet } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet')
      return res.data
    },
  })

  const { data: txData, isLoading: loadingTx, refetch: refetchTx } = useQuery({
    queryKey: ['walletTransactions'],
    queryFn: async () => {
      const res = await api.get('/wallet/transactions')
      return res.data
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      refetchMembership(),
      refetchSubs(),
      refetchWallet(),
      refetchTx(),
    ])
    setRefreshing(false)
  }

  const isPaidMember = membershipData?.isPaidMember ?? false
  const expiresAt = membershipData?.expiresAt
    ? format(new Date(membershipData.expiresAt), 'MMMM dd, yyyy')
    : null

  const creatorSubs = subsData ?? []
  const transactions = txData?.transactions ?? []
  const billingHistory = transactions.filter(
    (t: any) => t.type === 'SUBSCRIPTION_PAYMENT' || t.type === 'DEPOSIT'
  )

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing & Subscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── 1. Platform Membership Status Card ── */}
        <Text style={styles.sectionHeader}>PLATFORM MEMBERSHIP</Text>
        <View style={[styles.card, isPaidMember && styles.cardActiveMember]}>
          <View style={styles.cardTop}>
            <View style={styles.planInfoRow}>
              <View style={[styles.iconWrap, isPaidMember ? styles.iconWrapActive : styles.iconWrapFree]}>
                <Sparkles size={20} color={isPaidMember ? '#EA580C' : '#64748B'} />
              </View>
              <View>
                <Text style={styles.planTitle}>
                  {isPaidMember ? 'NESORA Plus Membership' : 'Free Limited Plan'}
                </Text>
                <Text style={styles.planPrice}>
                  {isPaidMember ? '₦5,000 / month · Auto-renewing' : 'Free Tier'}
                </Text>
              </View>
            </View>

            <View style={[styles.statusBadge, isPaidMember ? styles.statusBadgeActive : styles.statusBadgeFree]}>
              <Text style={[styles.statusBadgeText, isPaidMember ? styles.statusBadgeTextActive : styles.statusBadgeTextFree]}>
                {isPaidMember ? 'ACTIVE' : 'FREE'}
              </Text>
            </View>
          </View>

          {isPaidMember ? (
            <View style={styles.memberDetails}>
              <View style={styles.detailRow}>
                <Calendar size={14} color="#64748B" />
                <Text style={styles.detailText}>
                  Next billing date: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{expiresAt}</Text>
                </Text>
              </View>
              <View style={styles.detailRow}>
                <ShieldCheck size={14} color="#10B981" />
                <Text style={styles.detailText}>
                  Unlimited content viewing, full HD videos & live stream chat enabled.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.upgradeBox}>
              <Text style={styles.upgradeText}>
                Upgrade to NESORA Plus to unlock unlimited creator feeds, HD media, and live streams.
              </Text>
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => setMembershipModalVisible(true)}
                activeOpacity={0.85}
              >
                <Sparkles size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.upgradeBtnText}>Upgrade to Plus (₦5,000/mo)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 2. Active Creator Subscriptions ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>CREATOR SUBSCRIPTIONS</Text>
          <Text style={styles.countText}>{creatorSubs.length} Active</Text>
        </View>

        {loadingSubs ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
        ) : creatorSubs.length === 0 ? (
          <View style={styles.emptySubsCard}>
            <User size={28} color="#94A3B8" style={{ marginBottom: 6 }} />
            <Text style={styles.emptySubsTitle}>No Creator Subscriptions</Text>
            <Text style={styles.emptySubsDesc}>
              When you subscribe to individual creator plans, they will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.subsList}>
            {creatorSubs.map((sub: any) => {
              const creator = sub.creator
              const creatorImage = creator?.user?.image

              return (
                <View key={sub.id} style={styles.subItemCard}>
                  <View style={styles.subItemLeft}>
                    {creatorImage ? (
                      <Image source={{ uri: creatorImage }} style={styles.subAvatar} />
                    ) : (
                      <View style={styles.subAvatarFallback}>
                        <Text style={styles.subAvatarInitial}>
                          {(creator?.displayName || 'C')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={styles.subCreatorName} numberOfLines={1}>
                        {creator?.displayName || 'Creator'}
                      </Text>
                      <Text style={styles.subPlanPrice}>
                        ₦{Number(sub.amountPaid ?? 2000).toLocaleString()}/mo · Active
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.viewChannelBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/(fan)/profile/[username]',
                        params: { username: creator?.handle || creator?.id },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewChannelBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}

        {/* ── 3. Wallet Balance Card ── */}
        <Text style={styles.sectionHeader}>WALLET & PAYMENT METHOD</Text>
        <View style={styles.card}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <Text style={styles.walletAmount}>
                ₦{(walletData?.balance ?? 0).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.topUpPill}
              onPress={() => setWalletModalVisible(true)}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.topUpPillText}>Top Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4. Billing History & Receipts ── */}
        <Text style={styles.sectionHeader}>BILLING HISTORY & RECEIPTS</Text>
        {loadingTx ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
        ) : billingHistory.length === 0 ? (
          <View style={styles.emptySubsCard}>
            <CreditCard size={28} color="#94A3B8" style={{ marginBottom: 6 }} />
            <Text style={styles.emptySubsTitle}>No Invoices Yet</Text>
            <Text style={styles.emptySubsDesc}>
              Past membership payments and top-ups will be listed here.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {billingHistory.map((item: any) => {
              const isDeposit = item.type === 'DEPOSIT'
              const dateStr = item.createdAt
                ? format(new Date(item.createdAt), 'MMM dd, yyyy')
                : ''

              return (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyIconWrap,
                        isDeposit ? styles.depositIconWrap : styles.subIconWrap,
                      ]}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft size={16} color="#10B981" />
                      ) : (
                        <CreditCard size={16} color="#EA580C" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDesc} numberOfLines={1}>
                        {item.description || (isDeposit ? 'Wallet Deposit' : 'Subscription')}
                      </Text>
                      <Text style={styles.historyDate}>{dateStr}</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.historyAmount}>
                      ₦{Number(item.amount).toLocaleString()}
                    </Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>PAID</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Membership Modal */}
      <MembershipModal
        visible={membershipModalVisible}
        onClose={() => {
          setMembershipModalVisible(false)
          refetchMembership()
        }}
      />

      {/* Wallet Modal */}
      <WalletModal
        visible={walletModalVisible}
        onClose={() => {
          setWalletModalVisible(false)
          refetchWallet()
          refetchTx()
        }}
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
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    ...Shadows.sm,
  },
  cardActiveMember: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#FDEEE9',
  },
  iconWrapFree: {
    backgroundColor: '#F1F5F9',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  planPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeFree: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadgeTextActive: {
    color: '#065F46',
  },
  statusBadgeTextFree: {
    color: '#64748B',
  },
  memberDetails: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12.5,
    color: '#475569',
    flex: 1,
  },
  upgradeBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  upgradeText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptySubsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptySubsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  emptySubsDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  subsList: {
    gap: 8,
    marginBottom: 20,
  },
  subItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  subItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  subAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F1EC',
  },
  subAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subAvatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  subCreatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subPlanPrice: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  viewChannelBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  viewChannelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  topUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  topUpPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  historyList: {
    gap: 8,
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  historyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositIconWrap: {
    backgroundColor: '#D1FAE5',
  },
  subIconWrap: {
    backgroundColor: '#FFF7ED',
  },
  historyDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  historyAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  paidBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
})

// app/(fan)/profile/wallet.tsx — Full Wallet & Transactions Screen
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Linking,
  StatusBar,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import {
  ArrowLeft,
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  ExternalLink,
  CreditCard,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

const TOPUP_PRESETS = [1000, 2000, 5000, 10000]

export default function FanWalletScreen() {
  const queryClient = useQueryClient()
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [amount, setAmount] = useState('2000')
  const [pendingRef, setPendingRef] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch Wallet Balance
  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet')
      return res.data
    },
  })

  // Fetch Wallet Transactions
  const { data: txData, isLoading: loadingTx, refetch: refetchTx } = useQuery({
    queryKey: ['walletTransactions'],
    queryFn: async () => {
      const res = await api.get('/wallet/transactions')
      return res.data
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchBalance(), refetchTx()])
    setRefreshing(false)
  }

  // Paystack Initialize Mutation
  const initMutation = useMutation({
    mutationFn: async (numAmount: number) => {
      const res = await api.post('/wallet/initialize', { amount: numAmount })
      return res.data
    },
    onSuccess: async (data) => {
      if (data?.authorizationUrl) {
        setPendingRef(data.reference)
        const supported = await Linking.canOpenURL(data.authorizationUrl)
        if (supported) {
          await Linking.openURL(data.authorizationUrl)
        } else {
          Alert.alert('Payment Link', `Open this link: ${data.authorizationUrl}`)
        }
      } else if (data?.error) {
        Alert.alert('Top Up Failed', data.error)
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not initialize top up.')
    },
  })

  // Verify Paystack Payment Mutation
  const verifyMutation = useMutation({
    mutationFn: async (ref: string) => {
      const res = await api.post('/wallet/verify', { reference: ref })
      return res.data
    },
    onSuccess: (data) => {
      if (data?.success) {
        Alert.alert('Top-Up Successful! 🎉', `Your new balance is ₦${(data.balance ?? 0).toLocaleString()}`)
        setPendingRef(null)
        setIsTopUpOpen(false)
        queryClient.invalidateQueries({ queryKey: ['walletBalance'] })
        queryClient.invalidateQueries({ queryKey: ['walletTransactions'] })
        refetchBalance()
        refetchTx()
      } else {
        Alert.alert('Verification Pending', data?.error || 'Payment not completed yet.')
      }
    },
    onError: (err: any) => {
      Alert.alert('Verification Error', err?.response?.data?.message || 'Could not verify payment yet.')
    },
  })

  const handleTopUpSubmit = () => {
    const num = Number(amount.replace(/[^0-9]/g, ''))
    if (isNaN(num) || num < 100) {
      Alert.alert('Invalid Amount', 'Minimum top-up amount is ₦100')
      return
    }
    initMutation.mutate(num)
  }

  const transactions = txData?.transactions ?? []
  const balance = balanceData?.balance ?? 0

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet & Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ── Balance Card (Matches Screenshot Dark Brown/Black) ── */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceValue}>
                ₦{loadingBalance ? '...' : balance.toLocaleString()}
              </Text>

              <TouchableOpacity
                style={styles.topUpBtn}
                onPress={() => setIsTopUpOpen(!isTopUpOpen)}
                activeOpacity={0.85}
              >
                <Plus size={15} color="#EA580C" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.topUpBtnText}>
                  {isTopUpOpen ? 'Hide top up' : 'Top up wallet'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Top Up Form (Expandable) ── */}
            {isTopUpOpen && (
              <View style={styles.topUpFormCard}>
                <Text style={styles.formTitle}>Select or Enter Amount</Text>

                {/* Preset Pills */}
                <View style={styles.presetsRow}>
                  {TOPUP_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.presetPill,
                        amount === String(preset) && styles.presetPillActive,
                      ]}
                      onPress={() => setAmount(String(preset))}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          amount === String(preset) && styles.presetPillTextActive,
                        ]}
                      >
                        ₦{preset.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Amount Input */}
                <View style={styles.inputWrap}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="Enter amount (min ₦100)"
                    placeholderTextColor="#A0AEC0"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>

                {/* Pay with Paystack Button */}
                <TouchableOpacity
                  style={[
                    styles.payBtn,
                    (!amount || initMutation.isPending) && styles.payBtnDisabled,
                  ]}
                  onPress={handleTopUpSubmit}
                  disabled={!amount || initMutation.isPending}
                  activeOpacity={0.85}
                >
                  {initMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <ExternalLink size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.payBtnText}>Pay with Paystack</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* If payment was launched in browser, show verify button */}
                {pendingRef && (
                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => verifyMutation.mutate(pendingRef)}
                    disabled={verifyMutation.isPending}
                    activeOpacity={0.85}
                  >
                    {verifyMutation.isPending ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <>
                        <CheckCircle2 size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.verifyBtnText}>I've Completed the Payment</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Transactions Header */}
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Transaction History</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isDeposit = item.type === 'DEPOSIT' || item.type === 'REFUND'
          const dateStr = item.createdAt
            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
            : ''

          return (
            <View style={styles.txItem}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconWrap,
                    isDeposit ? styles.txDepositWrap : styles.txDebitWrap,
                  ]}
                >
                  {isDeposit ? (
                    <ArrowDownLeft size={16} color="#10B981" />
                  ) : (
                    <ArrowUpRight size={16} color="#EF4444" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {item.description || (isDeposit ? 'Deposit' : 'Payment')}
                  </Text>
                  <Text style={styles.txDate}>{dateStr}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  isDeposit ? styles.txAmountDeposit : styles.txAmountDebit,
                ]}
              >
                {isDeposit ? '+' : '-'}₦{Number(item.amount).toLocaleString()}
              </Text>
            </View>
          )
        }}
        ListEmptyComponent={
          !loadingTx ? (
            <View style={styles.emptyTx}>
              <CreditCard size={36} color="#A0AEC0" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTxText}>No transactions yet</Text>
              <Text style={styles.emptyTxSub}>
                Your wallet top-ups, tips, and subscription payments will appear here.
              </Text>
            </View>
          ) : null
        }
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  /* Balance Card */
  balanceCard: {
    backgroundColor: '#1E1715',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...Shadows.sm,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A09794',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.28)',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: Radius.full,
  },
  topUpBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  /* Top up Form */
  topUpFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Shadows.sm,
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetPillActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF7ED',
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 10,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  payBtnDisabled: {
    opacity: 0.5,
  },
  payBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: 8,
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  /* Transactions Header */
  transactionsHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyTx: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTxText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyTxSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
    ...Shadows.sm,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  txIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDepositWrap: {
    backgroundColor: '#D1FAE5',
  },
  txDebitWrap: {
    backgroundColor: '#FEE2E2',
  },
  txDesc: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  txDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txAmountDeposit: {
    color: '#10B981',
  },
  txAmountDebit: {
    color: '#0F172A',
  },
})

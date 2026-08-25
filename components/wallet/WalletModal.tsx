// components/wallet/WalletModal.tsx — "My Wallet" modal matching user screenshot
import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert,
  Linking,
} from 'react-native'
import {
  Wallet as WalletIcon,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/lib/auth'
import { initializeWalletTopUp, verifyWalletTopUp } from '@/lib/paystack'
import { Colors, Radius, Shadows } from '@/constants/theme'

const TOPUP_PRESETS = [1000, 2000, 5000, 10000]

interface WalletModalProps {
  visible: boolean
  onClose: () => void
}

export function WalletModal({ visible, onClose }: WalletModalProps) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [amount, setAmount] = useState('2000')
  const [pendingRef, setPendingRef] = useState<string | null>(null)

  // Fetch Wallet balance & recent transactions
  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet')
      return res.data
    },
    enabled: visible,
  })

  const { data: txData, isLoading: loadingTx, refetch: refetchTx } = useQuery({
    queryKey: ['walletTransactions'],
    queryFn: async () => {
      const res = await api.get('/wallet/transactions', { params: { limit: 10 } })
      return res.data
    },
    enabled: visible,
  })

  // Paystack Initialize Mutation
  const initMutation = useMutation({
    mutationFn: async (numAmount: number) => {
      return await initializeWalletTopUp(numAmount, user?.email, user?.id)
    },
    onSuccess: async (data) => {
      if (data?.authorizationUrl) {
        setPendingRef(data.reference ?? null)
        // Open Paystack checkout in browser
        const supported = await Linking.canOpenURL(data.authorizationUrl)
        if (supported) {
          await Linking.openURL(data.authorizationUrl)
        } else {
          Alert.alert('Payment Link', `Open this link to complete payment: ${data.authorizationUrl}`)
        }
      } else if (data?.error) {
        Alert.alert('Top Up Failed', data.error)
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Could not initialize top up.')
    },
  })

  // Verify Paystack Payment Mutation
  const verifyMutation = useMutation({
    mutationFn: async (ref: string) => {
      const numAmount = parseInt(amount, 10) || 2000
      return await verifyWalletTopUp(ref, numAmount)
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
      Alert.alert('Verification Error', err?.response?.data?.message || err?.message || 'Could not verify payment yet.')
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Grab Handle */}
          <View style={styles.grabHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.walletIconWrap}>
                <WalletIcon size={18} color="#D97706" />
              </View>
              <Text style={styles.headerTitle}>My Wallet</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#718096" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
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
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
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

            {/* ── Recent Transactions Section ── */}
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>

            {loadingTx ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : transactions.length === 0 ? (
              <View style={styles.emptyTx}>
                <Text style={styles.emptyTxText}>No transactions yet</Text>
              </View>
            ) : (
              <View style={styles.txList}>
                {transactions.map((tx: any) => {
                  const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                  const dateStr = tx.createdAt
                    ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })
                    : ''

                  return (
                    <View key={tx.id} style={styles.txItem}>
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
                            {tx.description || (isDeposit ? 'Deposit' : 'Payment')}
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
                        {isDeposit ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Balance Card Matching Screenshot */
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
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
  /* Transactions */
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyTx: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  txList: {
    gap: 8,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  txIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginTop: 1,
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

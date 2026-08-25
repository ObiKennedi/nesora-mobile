import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native'
import {
  Menu,
  Bell,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Plus,
  X,
  Building2,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  Sparkles,
  ChevronDown,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { SideDrawer } from '@/components/navigation/SideDrawer'
import { Colors, Radius, Shadows } from '@/constants/theme'


const SCREEN_HEIGHT = Dimensions.get('window').height

const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Wema Bank', code: '035' },
]

export default function CreatorWalletScreen() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)


  // Modal States
  const [bankModalVisible, setBankModalVisible] = useState(false)
  const [payoutModalVisible, setPayoutModalVisible] = useState(false)
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false)

  // Bank Form State
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0])
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState('')
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)

  // 1. Fetch Creator Balance & Default Bank
  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['creatorWalletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet/creator/balance')
      return res.data
    },
  })

  // 2. Fetch Creator Bank Accounts
  const { data: bankData, isLoading: loadingBanks, refetch: refetchBanks } = useQuery({
    queryKey: ['creatorBankAccounts'],
    queryFn: async () => {
      const res = await api.get('/wallet/creator/banks')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  // 3. Fetch Payout History
  const { data: payoutHistory, isLoading: loadingPayouts, refetch: refetchPayouts } = useQuery({
    queryKey: ['creatorPayoutHistory'],
    queryFn: async () => {
      const res = await api.get('/wallet/creator/payouts')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchBalance(), refetchBanks(), refetchPayouts()])
    setRefreshing(false)
  }, [refetchBalance, refetchBanks, refetchPayouts])

  // ── Add Bank Account Mutation ──
  const addBankMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/wallet/creator/banks', {
        bankName: selectedBank.name,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankCode: selectedBank.code,
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data?.error) {
        Alert.alert('Error', data.error)
        return
      }
      Alert.alert('Bank Added! 🎉', 'Your payout account has been linked successfully.')
      setBankModalVisible(false)
      setAccountNumber('')
      setAccountName('')
      queryClient.invalidateQueries({ queryKey: ['creatorBankAccounts'] })
      queryClient.invalidateQueries({ queryKey: ['creatorWalletBalance'] })
      refetchBanks()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not add bank account.')
    },
  })

  // ── Set Default Bank Mutation ──
  const setDefaultBankMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const res = await api.post(`/wallet/creator/banks/${accountId}/default`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorBankAccounts'] })
      queryClient.invalidateQueries({ queryKey: ['creatorWalletBalance'] })
      refetchBanks()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not set default bank.')
    },
  })

  // ── Delete Bank Mutation ──
  const deleteBankMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const res = await api.delete(`/wallet/creator/banks/${accountId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorBankAccounts'] })
      refetchBanks()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not delete bank account.')
    },
  })

  // ── Request Payout Mutation ──
  const payoutMutation = useMutation({
    mutationFn: async () => {
      const numAmount = Number(payoutAmount.replace(/[^0-9]/g, ''))
      const res = await api.post('/wallet/creator/payout', {
        amount: numAmount,
        bankAccountId: selectedBankId || undefined,
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data?.error) {
        Alert.alert('Payout Failed', data.error)
        return
      }
      Alert.alert(
        'Payout Requested! 🎉',
        `Your request for ₦${(data.grossAmount ?? 0).toLocaleString()} (Net: ₦${(data.netAmount ?? 0).toLocaleString()}) has been submitted.`,
      )
      setPayoutModalVisible(false)
      setPayoutAmount('')
      queryClient.invalidateQueries({ queryKey: ['creatorWalletBalance'] })
      queryClient.invalidateQueries({ queryKey: ['creatorPayoutHistory'] })
      refetchBalance()
      refetchPayouts()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not submit payout request.')
    },
  })

  const availableBalance = balanceData?.balance ?? 0
  const banks = bankData ?? []
  const payouts = payoutHistory ?? []

  const handleOpenPayout = () => {
    if (banks.length === 0) {
      Alert.alert('No Bank Linked', 'Please add a bank account before requesting a payout.', [
        { text: 'Add Bank Account', onPress: () => setBankModalVisible(true) },
      ])
      return
    }
    const defaultBank = banks.find((b: any) => b.isDefault) || banks[0]
    setSelectedBankId(defaultBank?.id ?? null)
    setPayoutModalVisible(true)
  }

  const handleQuickPercent = (percent: number) => {
    const calculated = Math.floor((availableBalance * percent) / 100)
    setPayoutAmount(calculated.toString())
  }

  const isBankFormValid =
    selectedBank &&
    accountName.trim().length > 0 &&
    accountNumber.trim().length === 10

  const numPayout = Number(payoutAmount.replace(/[^0-9]/g, ''))
  const isPayoutValid = numPayout >= 1000 && numPayout <= availableBalance

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
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

        <Text style={styles.headerTitle}>Wallet</Text>

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


      <View style={styles.content}>
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Earnings</Text>
          <Text style={styles.balanceValue}>
            ₦{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.balanceSub}>
            Earnings from subscriptions, tips, gifts & paid call minutes.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.payoutBtn}
              onPress={handleOpenPayout}
              activeOpacity={0.85}
            >
              <ArrowDownRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.payoutBtnText}>Request Payout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bank Accounts Section ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <CreditCard size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Payout Methods</Text>
            </View>
            <TouchableOpacity
              style={styles.addBankShortcut}
              onPress={() => setBankModalVisible(true)}
              activeOpacity={0.8}
            >
              <Plus size={14} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.addBankShortcutText}>Add Bank</Text>
            </TouchableOpacity>
          </View>

          {banks.length === 0 ? (
            <View style={styles.emptyBankWrap}>
              <Building2 size={32} color="#94A3B8" />
              <Text style={styles.emptyBankTitle}>No bank account linked</Text>
              <Text style={styles.emptyBankSub}>
                Link your Nigerian bank account to receive withdrawals directly.
              </Text>
              <TouchableOpacity
                style={styles.addBankBtn}
                onPress={() => setBankModalVisible(true)}
                activeOpacity={0.85}
              >
                <Plus size={15} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.addBankText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bankList}>
              {banks.map((b: any) => (
                <View key={b.id} style={styles.bankCard}>
                  <View style={styles.bankCardLeft}>
                    <View style={styles.bankIconWrap}>
                      <Building2 size={18} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.bankNameRow}>
                        <Text style={styles.bankName} numberOfLines={1}>
                          {b.bankName}
                        </Text>
                        {b.isDefault && (
                          <View style={styles.defaultPill}>
                            <Text style={styles.defaultPillText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.accountNumber}>
                        {b.accountNumber} · {b.accountName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bankActions}>
                    {!b.isDefault && (
                      <TouchableOpacity
                        style={styles.setDefaultBtn}
                        onPress={() => setDefaultBankMutation.mutate(b.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.setDefaultText}>Make Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteBankBtn}
                      onPress={() => {
                        Alert.alert('Delete Account', `Remove ${b.bankName} (${b.accountNumber})?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteBankMutation.mutate(b.id) },
                        ])
                      }}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Payout History ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Clock size={18} color="#64748B" />
              <Text style={styles.sectionTitle}>Payout History</Text>
            </View>
          </View>

          {payouts.length === 0 ? (
            <View style={styles.emptyPayoutsWrap}>
              <Text style={styles.emptyPayoutsText}>No withdrawal requests yet.</Text>
            </View>
          ) : (
            <View style={styles.payoutList}>
              {payouts.map((p: any) => {
                const isApproved = p.status === 'PAID' || p.status === 'APPROVED'
                const isPending = p.status === 'PENDING' || p.status === 'PROCESSING'
                const timeStr = p.createdAt
                  ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })
                  : ''

                return (
                  <View key={p.id} style={styles.payoutItem}>
                    <View style={styles.payoutItemLeft}>
                      <View
                        style={[
                          styles.payoutStatusIcon,
                          isApproved ? styles.statusBgGreen : isPending ? styles.statusBgAmber : styles.statusBgRed,
                        ]}
                      >
                        {isApproved ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : isPending ? (
                          <Clock size={16} color="#D97706" />
                        ) : (
                          <X size={16} color="#EF4444" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.payoutBank}>
                          Withdrawal to {p.bankAccount?.bankName || 'Bank'}
                        </Text>
                        <Text style={styles.payoutDate}>{timeStr}</Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.payoutAmount}>
                        ₦{(p.netAmount ?? p.grossAmount ?? 0).toLocaleString()}
                      </Text>
                      <Text
                        style={[
                          styles.payoutStatusText,
                          isApproved ? styles.textGreen : isPending ? styles.textAmber : styles.textRed,
                        ]}
                      >
                        {p.status}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* ── Security Note ── */}
        <View style={styles.securityNote}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.securityText}>
            Payouts processed securely via Paystack Direct Settlement.
          </Text>
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          1. ADD BANK ACCOUNT MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={bankModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Building2 size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Link Bank Account</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBankModalVisible(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Bank Selector */}
              <Text style={styles.fieldLabel}>Select Bank *</Text>
              <TouchableOpacity
                style={styles.bankSelectTrigger}
                onPress={() => setBankDropdownOpen(!bankDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.bankSelectText}>{selectedBank.name}</Text>
                <ChevronDown size={18} color="#64748B" />
              </TouchableOpacity>

              {bankDropdownOpen && (
                <View style={styles.bankDropdownList}>
                  {NIGERIAN_BANKS.map((b) => (
                    <TouchableOpacity
                      key={b.code}
                      style={[
                        styles.bankDropdownItem,
                        selectedBank.code === b.code && styles.bankDropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedBank(b)
                        setBankDropdownOpen(false)
                      }}
                    >
                      <Text
                        style={[
                          styles.bankDropdownText,
                          selectedBank.code === b.code && styles.bankDropdownTextActive,
                        ]}
                      >
                        {b.name}
                      </Text>
                      {selectedBank.code === b.code && <Check size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Account Number */}
              <Text style={styles.fieldLabel}>10-Digit Account Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 0123456789"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={10}
                value={accountNumber}
                onChangeText={setAccountNumber}
              />

              {/* Account Holder Name */}
              <Text style={styles.fieldLabel}>Account Holder Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name as registered on your bank"
                placeholderTextColor="#94A3B8"
                value={accountName}
                onChangeText={setAccountName}
                autoCapitalize="words"
              />

              {/* Save CTA */}
              <TouchableOpacity
                style={[
                  styles.submitModalBtn,
                  (!isBankFormValid || addBankMutation.isPending) && styles.btnDisabled,
                ]}
                onPress={() => addBankMutation.mutate()}
                disabled={!isBankFormValid || addBankMutation.isPending}
                activeOpacity={0.85}
              >
                {addBankMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Save Bank Account</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          2. REQUEST PAYOUT MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={payoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <ArrowDownRight size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Request Payout</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setPayoutModalVisible(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Available balance glance */}
              <View style={styles.payoutBalanceBox}>
                <Text style={styles.payoutBalanceBoxLabel}>Available to Withdraw</Text>
                <Text style={styles.payoutBalanceBoxVal}>
                  ₦{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Amount Input */}
              <Text style={styles.fieldLabel}>Withdrawal Amount (₦) *</Text>
              <TextInput
                style={[styles.input, { fontSize: 20, fontWeight: '700' }]}
                placeholder="Min ₦1,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={payoutAmount}
                onChangeText={setPayoutAmount}
              />

              {/* Quick Percent Buttons */}
              <View style={styles.quickPercentRow}>
                <TouchableOpacity
                  style={styles.percentBtn}
                  onPress={() => handleQuickPercent(25)}
                >
                  <Text style={styles.percentBtnText}>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.percentBtn}
                  onPress={() => handleQuickPercent(50)}
                >
                  <Text style={styles.percentBtnText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.percentBtn}
                  onPress={() => handleQuickPercent(75)}
                >
                  <Text style={styles.percentBtnText}>75%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.percentBtn}
                  onPress={() => handleQuickPercent(100)}
                >
                  <Text style={styles.percentBtnText}>All (100%)</Text>
                </TouchableOpacity>
              </View>

              {/* Target Bank Account Selector */}
              <Text style={styles.fieldLabel}>Select Destination Account</Text>
              <View style={styles.bankSelectOptions}>
                {banks.map((b: any) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.bankOptionCard,
                      selectedBankId === b.id && styles.bankOptionCardActive,
                    ]}
                    onPress={() => setSelectedBankId(b.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bankOptionName}>{b.bankName}</Text>
                      <Text style={styles.bankOptionSub}>
                        {b.accountNumber} · {b.accountName}
                      </Text>
                    </View>
                    {selectedBankId === b.id && (
                      <CheckCircle2 size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fee Breakdown */}
              {numPayout >= 1000 && (
                <View style={styles.feeBreakdownBox}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Gross Withdrawal</Text>
                    <Text style={styles.feeVal}>₦{numPayout.toLocaleString()}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Platform Fee (10%)</Text>
                    <Text style={styles.feeVal}>
                      -₦{Math.round((numPayout * 10) / 100).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.feeRow, styles.feeTotalRow]}>
                    <Text style={styles.feeTotalLabel}>Net Payout</Text>
                    <Text style={styles.feeTotalVal}>
                      ₦{(numPayout - Math.round((numPayout * 10) / 100)).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Submit CTA */}
              <TouchableOpacity
                style={[
                  styles.submitModalBtn,
                  (!isPayoutValid || payoutMutation.isPending) && styles.btnDisabled,
                ]}
                onPress={() => payoutMutation.mutate()}
                disabled={!isPayoutValid || payoutMutation.isPending}
                activeOpacity={0.85}
              >
                {payoutMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Confirm Withdrawal</Text>
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F2EE',
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
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },

  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    ...Shadows.md,
  },
  balanceLabel: {
    fontSize: 12.5,
    color: '#FDEEE9',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginVertical: 6,
  },
  balanceSub: {
    fontSize: 12,
    color: '#FBDCD3',
    lineHeight: 16,
  },
  buttonRow: {
    marginTop: 16,
  },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A3B14',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  payoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    gap: 14,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  addBankShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
  },
  addBankShortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyBankWrap: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  emptyBankTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 6,
  },
  emptyBankSub: {
    fontSize: 12.5,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 8,
  },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF7ED',
  },
  addBankText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  /* Bank List */
  bankList: {
    gap: 10,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bankIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  defaultPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  defaultPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  accountNumber: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  bankActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setDefaultBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  setDefaultText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteBankBtn: {
    padding: 4,
  },
  /* Payout History */
  emptyPayoutsWrap: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyPayoutsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  payoutList: {
    gap: 12,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  payoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payoutStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBgGreen: { backgroundColor: '#D1FAE5' },
  statusBgAmber: { backgroundColor: '#FEF3C7' },
  statusBgRed: { backgroundColor: '#FEE2E2' },
  payoutBank: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  payoutDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  payoutStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  textGreen: { color: '#10B981' },
  textAmber: { color: '#D97706' },
  textRed: { color: '#EF4444' },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 36,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  bankSelectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  bankSelectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  bankDropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 180,
    marginBottom: 14,
    ...Shadows.md,
  },
  bankDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bankDropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  bankDropdownText: {
    fontSize: 13.5,
    color: '#334155',
  },
  bankDropdownTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  submitModalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...Shadows.sm,
  },
  submitModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  /* Payout Modal Specials */
  payoutBalanceBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  payoutBalanceBoxLabel: {
    fontSize: 11.5,
    color: '#9A3412',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  payoutBalanceBoxVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 2,
  },
  quickPercentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  percentBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  percentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  bankSelectOptions: {
    gap: 8,
    marginBottom: 14,
  },
  bankOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankOptionCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: Colors.primary,
  },
  bankOptionName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  bankOptionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  feeBreakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginBottom: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  feeVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  feeTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  feeTotalLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  feeTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
})

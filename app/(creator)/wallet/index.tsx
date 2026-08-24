// app/(creator)/wallet/index.tsx — Creator Wallet & Payouts
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, CreditCard } from 'lucide-react-native'
import { Colors, Radius } from '@/constants/theme'

export default function CreatorWalletScreen() {
  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creator Wallet</Text>
      </View>

      <View style={styles.content}>
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₦0.00</Text>
          <Text style={styles.balanceSub}>Next automated payout scheduled for Friday</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.payoutBtn} activeOpacity={0.85}>
              <ArrowDownRight size={16} color="#FFFFFF" />
              <Text style={styles.payoutBtnText}>Request Payout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bank Account Info ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <CreditCard size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Payout Method</Text>
              <Text style={styles.infoSub}>Link your Nigerian bank account to receive earnings directly</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addBankBtn} activeOpacity={0.8}>
            <Text style={styles.addBankText}>Add Bank Account</Text>
          </TouchableOpacity>
        </View>

        {/* ── Security Note ── */}
        <View style={styles.securityNote}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.securityText}>
            Payouts processed securely via Paystack & Flutterwave.
          </Text>
        </View>
      </View>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#FDEEE9',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginVertical: 8,
  },
  balanceSub: {
    fontSize: 12.5,
    color: '#FBDCD3',
  },
  buttonRow: {
    marginTop: 18,
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 14,
  },
  infoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F6ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  infoSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
    lineHeight: 18,
  },
  addBankBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  addBankText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 12.5,
    color: '#718096',
    fontWeight: '500',
  },
})

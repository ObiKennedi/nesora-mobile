// app/(onboarding)/billing.tsx — New Sign-up Billing & Membership Showcase
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native'
import { router } from 'expo-router'
import {
  Sparkles,
  Check,
  Film,
  Zap,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius, Shadows } from '@/constants/theme'

const PLUS_BENEFITS = [
  {
    icon: Film,
    title: 'Unlimited Content Access',
    desc: 'Browse and watch all creator feeds, photos, and videos with zero limits.',
  },
  {
    icon: Zap,
    title: 'Live Streams & Interactive Chat',
    desc: 'Join creator live broadcasts, participate in real-time chat, and react.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging with Creators',
    desc: 'Send messages and requests directly to your favorite creators.',
  },
  {
    icon: ShieldCheck,
    title: 'Exclusive Member Badge',
    desc: 'Stand out across the platform with your verified NESORA Plus badge.',
  },
]

export default function OnboardingBillingScreen() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()
  const [pendingRef, setPendingRef] = useState<string | null>(null)

  // Initialize Paystack Recurring Subscription (₦5,000/mo)
  const initMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/subscription/membership/initialize')
      return res.data
    },
    onSuccess: async (data) => {
      if (data?.authorizationUrl) {
        setPendingRef(data.reference)
        const supported = await Linking.canOpenURL(data.authorizationUrl)
        if (supported) {
          await Linking.openURL(data.authorizationUrl)
        } else {
          Alert.alert('Payment Link', `Open this link to complete payment: ${data.authorizationUrl}`)
        }
      } else if (data?.error) {
        Alert.alert('Subscription Failed', data.error)
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not start membership payment.')
    },
  })

  // Verify Paystack Payment
  const verifyMutation = useMutation({
    mutationFn: async (ref: string) => {
      const res = await api.post('/subscription/membership/verify', { reference: ref })
      return res.data
    },
    onSuccess: (data) => {
      if (data?.isPaidMember || data?.success) {
        Alert.alert('Welcome to NESORA Plus! 🎉', 'Your membership is now active with unlimited access.', [
          {
            text: 'Get Started',
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['membershipStatus'] })
              router.replace('/(fan)/feed')
            },
          },
        ])
      } else {
        Alert.alert('Verification Pending', data?.error || 'Payment not confirmed yet.')
      }
    },
    onError: (err: any) => {
      Alert.alert('Verification Error', err?.response?.data?.message || 'Could not verify payment yet.')
    },
  })

  const handleSkipFree = () => {
    router.replace('/(fan)/feed')
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Brand Logo & Header ── */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandN}>N</Text>
            <Text style={styles.brandText}>esora</Text>
          </View>

          <View style={styles.badgeWrap}>
            <Sparkles size={14} color="#D97706" />
            <Text style={styles.badgeText}>MEMBERSHIP PLANS</Text>
          </View>

          <Text style={styles.title}>Choose Your Experience</Text>
          <Text style={styles.subtitle}>
            Unlock unlimited access to creator feeds, full HD videos, and live broadcasts.
          </Text>
        </View>

        {/* ── NESORA Plus Featured Card (₦5,000/mo) ── */}
        <View style={styles.planCard}>
          <View style={styles.planTop}>
            <View>
              <Text style={styles.planName}>NESORA Plus</Text>
              <Text style={styles.planTag}>Full Unlimited Access</Text>
            </View>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>RECOMMENDED</Text>
            </View>
          </View>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>₦5,000</Text>
            <Text style={styles.pricePeriod}>/ month · recurring billing</Text>
          </View>

          <View style={styles.divider} />

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            {PLUS_BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <View key={i} style={styles.benefitItem}>
                  <View style={styles.benefitIconWrap}>
                    <Icon size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.benefitTitle}>{b.title}</Text>
                    <Text style={styles.benefitDesc}>{b.desc}</Text>
                  </View>
                </View>
              )
            })}
          </View>

          {/* Subscribe CTA Button */}
          <TouchableOpacity
            style={[
              styles.subscribeBtn,
              initMutation.isPending && styles.subscribeBtnDisabled,
            ]}
            onPress={() => initMutation.mutate()}
            disabled={initMutation.isPending}
            activeOpacity={0.85}
          >
            {initMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.subscribeBtnText}>Subscribe with Paystack</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Payment Verification Trigger */}
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

        {/* ── Free Plan Option (Skip) ── */}
        <View style={styles.freeCard}>
          <View style={styles.freeTop}>
            <View>
              <Text style={styles.freeTitle}>Free Limited Plan</Text>
              <Text style={styles.freeDesc}>
                Preview public creator posts with limited access.
              </Text>
            </View>
            <Text style={styles.freePrice}>₦0</Text>
          </View>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkipFree}
            activeOpacity={0.8}
          >
            <Text style={styles.skipBtnText}>Continue with Free Plan</Text>
            <ArrowRight size={16} color="#64748B" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  brandN: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8A3B14',
    letterSpacing: -0.5,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 5,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  /* Plan Card */
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 20,
    marginBottom: 16,
    ...Shadows.sm,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  planTag: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  popularBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    marginRight: 6,
  },
  pricePeriod: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  benefitDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 15,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  subscribeBtnDisabled: {
    opacity: 0.5,
  },
  subscribeBtnText: {
    fontSize: 14,
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
    paddingVertical: 11,
    borderRadius: Radius.md,
    marginTop: 10,
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  /* Free Card */
  freeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  freeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  freeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  freeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 220,
  },
  freePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#64748B',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
})

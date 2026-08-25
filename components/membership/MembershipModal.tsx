// components/membership/MembershipModal.tsx — ₦5,000/mo NESORA Plus Platform Membership
import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native'
import {
  Sparkles,
  X,
  Check,
  ShieldCheck,
  Zap,
  Film,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

const BENEFITS = [
  {
    icon: Film,
    title: 'Unlimited Content Access',
    desc: 'Watch and browse all creator posts, photos, and videos with zero limits.',
  },
  {
    icon: Zap,
    title: 'Live Streams & Interactive Chat',
    desc: 'Join all creator live broadcasts with HD audio and real-time chat.',
  },
  {
    icon: MessageSquare,
    title: 'Priority Direct Messaging',
    desc: 'Send messages and requests directly to creators you follow.',
  },
  {
    icon: ShieldCheck,
    title: 'Exclusive Member Badge',
    desc: 'Stand out across the platform with your verified NESORA Plus badge.',
  },
]

interface MembershipModalProps {
  visible: boolean
  onClose: () => void
}

export function MembershipModal({ visible, onClose }: MembershipModalProps) {
  const queryClient = useQueryClient()
  const [pendingRef, setPendingRef] = useState<string | null>(null)

  // Check Membership Status
  const { data: statusData, isLoading: loadingStatus, refetch } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await api.get('/subscription/membership/status')
      return res.data
    },
    enabled: visible,
  })

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
          Alert.alert('Payment Link', `Open this link: ${data.authorizationUrl}`)
        }
      } else if (data?.error) {
        Alert.alert('Upgrade Failed', data.error)
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not start membership checkout.')
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
        Alert.alert('Welcome to NESORA Plus! 🎉', 'You now have unlimited access across NESORA.')
        setPendingRef(null)
        queryClient.invalidateQueries({ queryKey: ['membershipStatus'] })
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        refetch()
        onClose()
      } else {
        Alert.alert('Verification Pending', data?.error || 'Payment not completed yet.')
      }
    },
    onError: (err: any) => {
      Alert.alert('Verification Error', err?.response?.data?.message || 'Could not verify membership payment.')
    },
  })

  const isPaidMember = statusData?.isPaidMember ?? false

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grabHandle} />

          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={18} color="#718096" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Header / Hero */}
            <View style={styles.heroSection}>
              <View style={styles.badgeWrap}>
                <Sparkles size={14} color="#D97706" />
                <Text style={styles.badgeText}>NESORA PLUS</Text>
              </View>

              <Text style={styles.heroTitle}>Unlock Unlimited Content</Text>
              <Text style={styles.heroSub}>
                Join NESORA Plus to enjoy unlimited access to all creator feeds, full HD media, and live streams.
              </Text>

              {/* Price Banner */}
              <View style={styles.priceCard}>
                <View>
                  <Text style={styles.priceAmount}>₦5,000</Text>
                  <Text style={styles.pricePeriod}>per month · recurring billing</Text>
                </View>
                {isPaidMember ? (
                  <View style={styles.activePill}>
                    <Check size={13} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.activePillText}>Active Member</Text>
                  </View>
                ) : (
                  <View style={styles.savePill}>
                    <Text style={styles.savePillText}>Cancel Anytime</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Benefits List */}
            <View style={styles.benefitsList}>
              {BENEFITS.map((b, i) => {
                const Icon = b.icon
                return (
                  <View key={i} style={styles.benefitItem}>
                    <View style={styles.benefitIconWrap}>
                      <Icon size={18} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.benefitTitle}>{b.title}</Text>
                      <Text style={styles.benefitDesc}>{b.desc}</Text>
                    </View>
                  </View>
                )
              })}
            </View>

            {/* CTA Button */}
            {!isPaidMember && (
              <TouchableOpacity
                style={[
                  styles.ctaBtn,
                  initMutation.isPending && styles.ctaBtnDisabled,
                ]}
                onPress={() => initMutation.mutate()}
                disabled={initMutation.isPending}
                activeOpacity={0.85}
              >
                {initMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.ctaBtnText}>Upgrade to NESORA Plus (₦5,000/mo)</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Verification trigger if payment launched */}
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

            {isPaidMember && (
              <View style={styles.activeNotice}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.activeNoticeText}>
                  You have an active NESORA Plus membership!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  grabHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 20,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 16,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  pricePeriod: {
    fontSize: 11,
    color: '#9A3412',
    fontWeight: '500',
  },
  savePill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  savePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  benefitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  ctaBtnDisabled: {
    opacity: 0.5,
  },
  ctaBtnText: {
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
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: 10,
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  activeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: Radius.md,
  },
  activeNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
})

// components/navigation/SideDrawer.tsx — Hamburger Side Navigation Drawer
import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import {
  X,
  Wallet,
  CreditCard,
  Heart,
  Bookmark,
  Settings,
  Shield,
  LogOut,
  Sparkles,
  ChevronRight,
  Plus,
  Compass,
  ArrowRightLeft,
} from 'lucide-react-native'
import { useAuthStore } from '@/lib/auth'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

const SCREEN_WIDTH = Dimensions.get('window').width
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330)

type Props = {
  visible: boolean
  onClose: () => void
}

export function SideDrawer({ visible, onClose }: Props) {
  const { user, logout } = useAuthStore()

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet')
      return res.data
    },
    enabled: visible,
  })

  // Fetch membership status
  const { data: membershipData } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await api.get('/subscription/membership/status')
      return res.data
    },
    enabled: visible,
  })

  const isPaidMember = membershipData?.isPaidMember ?? false
  const isCreator = user?.onboardingType === 'CREATOR'

  const navigateTo = (path: string) => {
    onClose()
    setTimeout(() => {
      router.push(path as any)
    }, 150)
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of NESORA?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          onClose()
          await logout()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer Content */}
        <View style={styles.drawer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerScroll}>
            {/* ── Top Header ── */}
            <View style={styles.headerRow}>
              <View style={styles.brandRow}>
                <Text style={styles.brandN}>N</Text>
                <Text style={styles.brandText}>esora</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* ── User Profile Card ── */}
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => navigateTo(isCreator ? '/(creator)/dashboard' : '/(fan)/profile')}
              activeOpacity={0.85}
            >
              {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {(user?.name || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'NESORA Member'}
                </Text>
                <Text style={styles.userHandle} numberOfLines={1}>
                  @{user?.username || 'member'}
                </Text>
              </View>

              <View style={[styles.roleBadge, isCreator ? styles.roleCreator : styles.roleFan]}>
                <Text style={[styles.roleText, isCreator ? styles.roleCreatorText : styles.roleFanText]}>
                  {isCreator ? 'CREATOR' : 'FAN'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* ── Wallet Card ── */}
            <View style={styles.walletCard}>
              <View style={styles.walletTop}>
                <View>
                  <Text style={styles.walletLabel}>AVAILABLE BALANCE</Text>
                  <Text style={styles.walletAmount}>
                    ₦{(walletData?.balance ?? 0).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.topUpBtn}
                  onPress={() => navigateTo('/(fan)/profile/wallet')}
                  activeOpacity={0.85}
                >
                  <Plus size={14} color="#EA580C" style={{ marginRight: 3 }} />
                  <Text style={styles.topUpBtnText}>Fund</Text>
                </TouchableOpacity>
              </View>

              {/* Membership Pill */}
              <TouchableOpacity
                style={[styles.memberPill, isPaidMember && styles.memberPillActive]}
                onPress={() => navigateTo('/(fan)/profile/billing')}
                activeOpacity={0.85}
              >
                <Sparkles size={13} color={isPaidMember ? '#059669' : '#D97706'} />
                <Text style={[styles.memberPillText, isPaidMember && styles.memberPillTextActive]}>
                  {isPaidMember ? 'NESORA Plus Active' : 'Upgrade to Plus (₦5,000/mo)'}
                </Text>
                <ChevronRight size={14} color={isPaidMember ? '#059669' : '#D97706'} />
              </TouchableOpacity>
            </View>

            {/* ── Navigation Menu Section ── */}
            <Text style={styles.sectionTitle}>QUICK NAVIGATION</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/(fan)/profile/wallet')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Wallet size={18} color="#2E7D32" />
              </View>
              <Text style={styles.menuLabel}>My Wallet & Top-up</Text>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/(fan)/profile/billing')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FFF7ED' }]}>
                <CreditCard size={18} color="#EA580C" />
              </View>
              <Text style={styles.menuLabel}>Billing & Subscriptions</Text>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/(fan)/profile/liked')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FCE4EC' }]}>
                <Heart size={18} color="#C2185B" />
              </View>
              <Text style={styles.menuLabel}>Liked Posts</Text>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/(fan)/profile/saved')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#EDE7F6' }]}>
                <Bookmark size={18} color="#512DA8" />
              </View>
              <Text style={styles.menuLabel}>Saved Content</Text>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/(fan)/profile/settings')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#ECEFF1' }]}>
                <Settings size={18} color="#455A64" />
              </View>
              <Text style={styles.menuLabel}>Settings & Privacy</Text>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* ── Portal Switcher ── */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/(onboarding)/select-type')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <ArrowRightLeft size={18} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>
                  {isCreator ? 'Switch to Fan Mode' : 'Switch to Creator Portal'}
                </Text>
                <Text style={styles.menuSub}>Change account experience</Text>
              </View>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            {/* ── Sign Out ── */}
            <TouchableOpacity
              style={[styles.menuItem, styles.signOutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <LogOut size={18} color="#DC2626" />
              </View>
              <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    ...Shadows.lg,
  },
  drawerScroll: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandN: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#8A3B14',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  roleCreator: {
    backgroundColor: '#FFF7ED',
  },
  roleFan: {
    backgroundColor: '#F1F5F9',
  },
  roleText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleCreatorText: {
    color: '#EA580C',
  },
  roleFanText: {
    color: '#64748B',
  },
  walletCard: {
    backgroundColor: '#1E1715',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  walletTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#A09794',
    letterSpacing: 0.8,
  },
  walletAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  topUpBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 243, 199, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(254, 243, 199, 0.3)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 6,
  },
  memberPillActive: {
    backgroundColor: 'rgba(209, 250, 229, 0.15)',
    borderColor: 'rgba(209, 250, 229, 0.3)',
  },
  memberPillText: {
    fontSize: 11.5,
    color: '#FDE68A',
    fontWeight: '600',
    flex: 1,
  },
  memberPillTextActive: {
    color: '#A7F3D0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 12,
    marginBottom: 2,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  menuSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  signOutItem: {
    marginTop: 4,
  },
})

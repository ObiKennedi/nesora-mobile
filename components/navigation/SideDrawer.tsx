// components/navigation/SideDrawer.tsx — Creator (Dark) & Fan (Light) Side Navigation Drawer
import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native'
import { router, usePathname } from 'expo-router'
import {
  X,
  LayoutGrid,
  FileText,
  Phone,
  Users,
  Radio,
  MessageCircle,
  BarChart2,
  DollarSign,
  User,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Wallet,
  CreditCard,
  Heart,
  Bookmark,
  Sparkles,
  ArrowRightLeft,
  Plus,
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
  const { user, logout, activeMode, setActiveMode } = useAuthStore()
  const pathname = usePathname()

  const isCreatorMode = activeMode === 'CREATOR'

  // Expandable sections for Creator Drawer
  const [contentExpanded, setContentExpanded] = useState(true)
  const [audienceExpanded, setAudienceExpanded] = useState(false)
  const [monetizationExpanded, setMonetizationExpanded] = useState(false)

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: [isCreatorMode ? 'creatorWalletBalance' : 'walletBalance'],
    queryFn: async () => {
      const res = await api.get(isCreatorMode ? '/wallet/creator/balance' : '/wallet')
      return res.data
    },
    enabled: visible,
  })

  // Fetch membership status (for Fans)
  const { data: membershipData } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await api.get('/subscription/membership/status')
      return res.data
    },
    enabled: visible && !isCreatorMode,
  })


  const isPaidMember = membershipData?.isPaidMember ?? false

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

  const name = user?.name || (isCreator ? 'Creator' : 'Fan Member')
  const username = user?.username || 'member'

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

        {/* ════════════════════════════════════════════════════════════════════
            CREATOR SIDE DRAWER (DARK SLEEK THEME — MATCHING SCREENSHOT)
        ════════════════════════════════════════════════════════════════════ */}
        {isCreatorMode ? (
          <View style={styles.creatorDrawer}>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.creatorScroll}
            >
              {/* Header: Nesora Brand & Close */}
              <View style={styles.creatorHeader}>
                <Text style={styles.creatorBrand}>Nesora</Text>
                <TouchableOpacity
                  style={styles.creatorCloseBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={19} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* Creator Profile Summary */}
              <TouchableOpacity
                style={styles.creatorProfileCard}
                onPress={() => navigateTo('/(creator)/dashboard')}
                activeOpacity={0.8}
              >
                {user?.image ? (
                  <Image source={{ uri: user.image }} style={styles.creatorAvatar} />
                ) : (
                  <View style={styles.creatorAvatarFallback}>
                    <Text style={styles.creatorAvatarInitial}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.creatorName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.creatorHandle} numberOfLines={1}>
                    @{username}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* ── Nav Items ── */}
              <View style={styles.navGroup}>
                {/* 1. Dashboard */}
                <TouchableOpacity
                  style={[
                    styles.cMenuItem,
                    pathname.includes('dashboard') && styles.cMenuItemActive,
                  ]}
                  onPress={() => navigateTo('/(creator)/dashboard')}
                  activeOpacity={0.7}
                >
                  <LayoutGrid
                    size={18}
                    color={pathname.includes('dashboard') ? Colors.primary : '#A1A1AA'}
                  />
                  <Text
                    style={[
                      styles.cMenuLabel,
                      pathname.includes('dashboard') && styles.cMenuLabelActive,
                    ]}
                  >
                    Dashboard
                  </Text>
                </TouchableOpacity>

                {/* 2. Content (Expandable) */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => setContentExpanded(!contentExpanded)}
                  activeOpacity={0.7}
                >
                  <FileText size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Content</Text>
                  {contentExpanded ? (
                    <ChevronUp size={16} color="#71717A" />
                  ) : (
                    <ChevronDown size={16} color="#71717A" />
                  )}
                </TouchableOpacity>

                {contentExpanded && (
                  <View style={styles.subMenuGroup}>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigateTo('/(creator)/content')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.subMenuBullet}>›</Text>
                      <Text style={styles.subMenuLabel}>Feed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigateTo('/(creator)/content')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.subMenuBullet}>›</Text>
                      <Text style={styles.subMenuLabel}>Drafts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigateTo('/(creator)/content')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.subMenuBullet}>›</Text>
                      <Text style={styles.subMenuLabel}>Scheduled</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. Calls */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => navigateTo('/(creator)/dashboard')}
                  activeOpacity={0.7}
                >
                  <Phone size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Calls</Text>
                </TouchableOpacity>

                {/* 4. Audience (Expandable) */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => setAudienceExpanded(!audienceExpanded)}
                  activeOpacity={0.7}
                >
                  <Users size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Audience</Text>
                  {audienceExpanded ? (
                    <ChevronUp size={16} color="#71717A" />
                  ) : (
                    <ChevronDown size={16} color="#71717A" />
                  )}
                </TouchableOpacity>

                {audienceExpanded && (
                  <View style={styles.subMenuGroup}>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigateTo('/(creator)/audience')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.subMenuBullet}>›</Text>
                      <Text style={styles.subMenuLabel}>Subscribers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigateTo('/(creator)/audience')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.subMenuBullet}>›</Text>
                      <Text style={styles.subMenuLabel}>Followers</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 5. Live */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => navigateTo('/(creator)/dashboard')}
                  activeOpacity={0.7}
                >
                  <Radio size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Live</Text>
                </TouchableOpacity>

                {/* 6. Messages */}
                <TouchableOpacity
                  style={[
                    styles.cMenuItem,
                    pathname.includes('messages') && styles.cMenuItemActive,
                  ]}
                  onPress={() => navigateTo('/(creator)/messages')}
                  activeOpacity={0.7}
                >
                  <MessageCircle
                    size={18}
                    color={pathname.includes('messages') ? Colors.primary : '#A1A1AA'}
                  />
                  <Text
                    style={[
                      styles.cMenuLabel,
                      pathname.includes('messages') && styles.cMenuLabelActive,
                    ]}
                  >
                    Messages
                  </Text>
                </TouchableOpacity>

                {/* 7. Analytics */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => navigateTo('/(creator)/dashboard')}
                  activeOpacity={0.7}
                >
                  <BarChart2 size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Analytics</Text>
                </TouchableOpacity>

                {/* 8. Monetization & Wallet */}
                <TouchableOpacity
                  style={[
                    styles.cMenuItem,
                    pathname.includes('wallet') && styles.cMenuItemActive,
                  ]}
                  onPress={() => setMonetizationExpanded(!monetizationExpanded)}
                  activeOpacity={0.7}
                >
                  <DollarSign
                    size={18}
                    color={pathname.includes('wallet') ? Colors.primary : '#A1A1AA'}
                  />
                  <Text
                    style={[
                      styles.cMenuLabel,
                      pathname.includes('wallet') && styles.cMenuLabelActive,
                    ]}
                  >
                    Monetization
                  </Text>
                  {monetizationExpanded ? (
                    <ChevronUp size={16} color="#71717A" />
                  ) : (
                    <ChevronDown size={16} color="#71717A" />
                  )}
                </TouchableOpacity>

                {monetizationExpanded && (
                  <View style={styles.subMenuGroup}>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigateTo('/(creator)/wallet')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.subMenuBullet}>›</Text>
                      <Text style={styles.subMenuLabel}>Wallet & Payouts</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 9. Profile */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => navigateTo('/(creator)/dashboard')}
                  activeOpacity={0.7}
                >
                  <User size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Profile</Text>
                </TouchableOpacity>

                {/* 10. Verification */}
                <TouchableOpacity
                  style={styles.cMenuItem}
                  onPress={() => navigateTo('/(creator)/dashboard')}
                  activeOpacity={0.7}
                >
                  <ShieldCheck size={18} color="#A1A1AA" />
                  <Text style={styles.cMenuLabel}>Verification</Text>
                </TouchableOpacity>

                {/* 11. Settings */}
                <TouchableOpacity
                  style={[
                    styles.cMenuItem,
                    pathname.includes('settings') && styles.cMenuItemActive,
                  ]}
                  onPress={() => navigateTo('/(fan)/profile/settings')}
                  activeOpacity={0.7}
                >
                  <Settings
                    size={18}
                    color={pathname.includes('settings') ? Colors.primary : '#A1A1AA'}
                  />
                  <Text
                    style={[
                      styles.cMenuLabel,
                      pathname.includes('settings') && styles.cMenuLabelActive,
                    ]}
                  >
                    Settings
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Switch to Fan Mode ── */}
              <TouchableOpacity
                style={styles.cSwitchBtn}
                onPress={async () => {
                  await setActiveMode('FAN')
                  onClose()
                  setTimeout(() => {
                    router.replace('/(fan)/feed')
                  }, 150)
                }}
                activeOpacity={0.8}
              >
                <ArrowRightLeft size={17} color="#A1A1AA" />
                <Text style={styles.cSwitchText}>Switch to Fan View</Text>
              </TouchableOpacity>

              {/* ── Sign Out ── */}
              <TouchableOpacity
                style={styles.cSignOutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut size={18} color="#71717A" />
                <Text style={styles.cSignOutText}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

        ) : (
          /* ════════════════════════════════════════════════════════════════════
              FAN SIDE DRAWER (LIGHT THEME)
          ════════════════════════════════════════════════════════════════════ */
          <View style={styles.fanDrawer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.fanScroll}
            >
              {/* Header */}
              <View style={styles.fanHeader}>
                <View style={styles.brandRow}>
                  <Text style={styles.brandN}>N</Text>
                  <Text style={styles.brandText}>esora</Text>
                </View>
                <TouchableOpacity style={styles.fanCloseBtn} onPress={onClose} activeOpacity={0.7}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Fan Profile Card */}
              <TouchableOpacity
                style={styles.fanProfileCard}
                onPress={() => navigateTo('/(fan)/profile')}
                activeOpacity={0.85}
              >
                {user?.image ? (
                  <Image source={{ uri: user.image }} style={styles.fanAvatar} />
                ) : (
                  <View style={styles.fanAvatarFallback}>
                    <Text style={styles.fanAvatarInitial}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.fanName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.fanHandle} numberOfLines={1}>
                    @{username}
                  </Text>
                </View>
                <View style={styles.roleFanBadge}>
                  <Text style={styles.roleFanText}>FAN</Text>
                </View>
              </TouchableOpacity>

              {/* Wallet Card */}
              <View style={styles.fanWalletCard}>
                <View style={styles.fanWalletTop}>
                  <View>
                    <Text style={styles.fanWalletLabel}>AVAILABLE BALANCE</Text>
                    <Text style={styles.fanWalletAmount}>
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

              {/* Menu Links */}
              <Text style={styles.fanSectionTitle}>QUICK NAVIGATION</Text>

              <TouchableOpacity
                style={styles.fanMenuItem}
                onPress={() => navigateTo('/(fan)/profile/wallet')}
                activeOpacity={0.7}
              >
                <View style={[styles.fanMenuIconWrap, { backgroundColor: '#E8F5E9' }]}>
                  <Wallet size={18} color="#2E7D32" />
                </View>
                <Text style={styles.fanMenuLabel}>My Wallet & Top-up</Text>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fanMenuItem}
                onPress={() => navigateTo('/(fan)/profile/billing')}
                activeOpacity={0.7}
              >
                <View style={[styles.fanMenuIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <CreditCard size={18} color="#EA580C" />
                </View>
                <Text style={styles.fanMenuLabel}>Billing & Subscriptions</Text>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fanMenuItem}
                onPress={() => navigateTo('/(fan)/profile/liked')}
                activeOpacity={0.7}
              >
                <View style={[styles.fanMenuIconWrap, { backgroundColor: '#FCE4EC' }]}>
                  <Heart size={18} color="#C2185B" />
                </View>
                <Text style={styles.fanMenuLabel}>Liked Posts</Text>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fanMenuItem}
                onPress={() => navigateTo('/(fan)/profile/saved')}
                activeOpacity={0.7}
              >
                <View style={[styles.fanMenuIconWrap, { backgroundColor: '#EDE7F6' }]}>
                  <Bookmark size={18} color="#512DA8" />
                </View>
                <Text style={styles.fanMenuLabel}>Saved Content</Text>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fanMenuItem}
                onPress={() => navigateTo('/(fan)/profile/settings')}
                activeOpacity={0.7}
              >
                <View style={[styles.fanMenuIconWrap, { backgroundColor: '#ECEFF1' }]}>
                  <Settings size={18} color="#455A64" />
                </View>
                <Text style={styles.fanMenuLabel}>Settings & Privacy</Text>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.divider} />

              {user?.onboardingType === 'CREATOR' ? (
                <TouchableOpacity
                  style={styles.fanMenuItem}
                  onPress={async () => {
                    await setActiveMode('CREATOR')
                    onClose()
                    setTimeout(() => {
                      router.replace('/(creator)/dashboard' as any)
                    }, 150)
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.fanMenuIconWrap, { backgroundColor: '#FFF7ED' }]}>
                    <Sparkles size={18} color="#EA580C" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fanMenuLabel, { color: '#EA580C', fontWeight: '700' }]}>
                      Switch to Creator Mode
                    </Text>
                    <Text style={styles.fanMenuSub}>Manage content & studio</Text>
                  </View>
                  <ChevronRight size={17} color="#EA580C" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.fanMenuItem}
                  onPress={() => navigateTo('/(onboarding)/select-type')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.fanMenuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <ArrowRightLeft size={18} color="#B45309" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fanMenuLabel}>Become a Creator</Text>
                    <Text style={styles.fanMenuSub}>Set up your creator profile</Text>
                  </View>
                  <ChevronRight size={17} color="#94A3B8" />
                </TouchableOpacity>
              )}


              <TouchableOpacity
                style={[styles.fanMenuItem, { marginTop: 8 }]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={[styles.fanMenuIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <LogOut size={18} color="#DC2626" />
                </View>
                <Text style={[styles.fanMenuLabel, { color: '#DC2626' }]}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  /* ── Creator Dark Theme Drawer ── */
  creatorDrawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#121212',
    ...Shadows.lg,
  },
  creatorScroll: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  creatorBrand: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: -0.5,
  },
  creatorCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#2D2D2D',
  },
  creatorAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D160C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  creatorHandle: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 1,
  },
  navGroup: {
    gap: 4,
  },
  cMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  cMenuItemActive: {
    backgroundColor: '#27140B',
  },
  cMenuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4D4D8',
    flex: 1,
  },
  cMenuLabelActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  subMenuGroup: {
    paddingLeft: 36,
    gap: 2,
    marginBottom: 4,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  subMenuBullet: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '800',
  },
  subMenuLabel: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  cSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  cSwitchText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#E4E4E7',
  },
  cSignOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },

  cSignOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },

  /* ── Fan Light Theme Drawer ── */
  fanDrawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    ...Shadows.lg,
  },
  fanScroll: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  fanHeader: {
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
  fanCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanProfileCard: {
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
  fanAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  fanAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanAvatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  fanName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  fanHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  roleFanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  roleFanText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  fanWalletCard: {
    backgroundColor: '#1E1715',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  fanWalletTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fanWalletLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#A09794',
    letterSpacing: 0.8,
  },
  fanWalletAmount: {
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
  fanSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  fanMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 12,
    marginBottom: 2,
  },
  fanMenuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanMenuLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  fanMenuSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
})

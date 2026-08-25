// app/(fan)/profile/settings.tsx — Settings & Privacy Screen
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import {
  ArrowLeft,
  Shield,
  Lock,
  Bell,
  Eye,
  User,
  Sparkles,
  ChevronRight,
  LogOut,
  Trash2,
} from 'lucide-react-native'
import { useAuthStore } from '@/lib/auth'
import { MembershipModal } from '@/components/membership/MembershipModal'
import { Colors, Radius, Shadows } from '@/constants/theme'

export default function SettingsAndPrivacyScreen() {
  const { user, logout } = useAuthStore()
  const [membershipModalVisible, setMembershipModalVisible] = useState(false)

  // Toggle states
  const [allowMessageRequests, setAllowMessageRequests] = useState(true)
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)
  const [privateAccount, setPrivateAccount] = useState(false)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of NESORA?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently erase your NESORA account, wallet balance, and subscriptions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Membership Banner ── */}
        <TouchableOpacity
          style={styles.membershipCard}
          onPress={() => setMembershipModalVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.membershipLeft}>
            <View style={styles.sparkleWrap}>
              <Sparkles size={20} color="#EA580C" />
            </View>
            <View>
              <Text style={styles.membershipTitle}>NESORA Plus Membership</Text>
              <Text style={styles.membershipSub}>₦5,000/mo · Unlimited content access</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#EA580C" />
        </TouchableOpacity>

        {/* ── Account Section ── */}
        <Text style={styles.sectionHeader}>ACCOUNT INFORMATION</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Full Name</Text>
            <Text style={styles.rowValue}>{user?.name || 'Member'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={styles.rowValue}>@{user?.username || 'member'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email || 'user@nesora.com'}</Text>
          </View>
        </View>

        {/* ── Privacy Settings ── */}
        <Text style={styles.sectionHeader}>PRIVACY</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Private Account</Text>
              <Text style={styles.switchSub}>Only approved followers can see your profile details.</Text>
            </View>
            <Switch
              value={privateAccount}
              onValueChange={setPrivateAccount}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Message Requests</Text>
              <Text style={styles.switchSub}>Allow creators you follow to send you message requests.</Text>
            </View>
            <Switch
              value={allowMessageRequests}
              onValueChange={setAllowMessageRequests}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Show Online Status</Text>
              <Text style={styles.switchSub}>Let creators and mutuals see when you are active.</Text>
            </View>
            <Switch
              value={showOnlineStatus}
              onValueChange={setShowOnlineStatus}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
        </View>

        {/* ── Notifications ── */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Push Notifications</Text>
              <Text style={styles.switchSub}>Receive alerts when creators go live or publish new posts.</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Email Digest</Text>
              <Text style={styles.switchSub}>Weekly roundup of top trending creators and content.</Text>
            </View>
            <Switch
              value={emailDigest}
              onValueChange={setEmailDigest}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
        </View>

        {/* ── Security & Actions ── */}
        <Text style={styles.sectionHeader}>SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Password Reset', `A password reset link will be sent to ${user?.email}`)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Lock size={18} color="#475569" />
              <Text style={styles.actionTitle}>Change Password</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ── Danger Zone ── */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={18} color="#C53030" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <Trash2 size={16} color="#94A3B8" style={{ marginRight: 6 }} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* NESORA Plus Modal */}
      <MembershipModal
        visible={membershipModalVisible}
        onClose={() => setMembershipModalVisible(false)}
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
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Shadows.sm,
  },
  membershipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  membershipSub: {
    fontSize: 12,
    color: '#9A3412',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 24,
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  dangerZone: {
    marginTop: 10,
    gap: 12,
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.full,
    paddingVertical: 12,
    width: '100%',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
})

// app/(fan)/profile/index.tsx — User Profile ("You" tab)
import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import {
  User,
  Settings,
  Wallet,
  Bookmark,
  Heart,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius } from '@/constants/theme'

export default function YouProfileScreen() {
  const { user, logout } = useAuthStore()

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

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Header Card ── */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={36} color={Colors.primary} />
            </View>
          )}
        </View>

        <Text style={styles.displayName}>{user?.name || 'NESORA Member'}</Text>
        <Text style={styles.username}>@{user?.username || 'member'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* ── Menu List ── */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(onboarding)/select-type' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#F6ECE2' }]}>
              <Shield size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Account Type & Creator Portal</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Wallet size={18} color="#2E7D32" />
            </View>
            <Text style={styles.menuText}>Wallet & Payments</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FCE4EC' }]}>
              <Heart size={18} color="#C2185B" />
            </View>
            <Text style={styles.menuText}>Liked Posts</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#EDE7F6' }]}>
              <Bookmark size={18} color="#512DA8" />
            </View>
            <Text style={styles.menuText}>Saved Content</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECEFF1' }]}>
              <Settings size={18} color="#455A64" />
            </View>
            <Text style={styles.menuText}>Settings & Privacy</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ── Logout Button ── */}
      <View style={styles.logoutWrap}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#C53030" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3EFEA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 64,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F6ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
  },
  username: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE7E0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFEA',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },
  logoutWrap: {
    padding: 24,
    paddingBottom: 100,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C53030',
  },
})

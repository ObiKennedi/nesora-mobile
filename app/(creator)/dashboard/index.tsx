// app/(creator)/dashboard/index.tsx — Creator Dashboard matching screenshot design
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import {
  Menu,
  Bell,
  Users,
  UserCheck,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  Plus,
} from 'lucide-react-native'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Colors, Radius, Shadows } from '@/constants/theme'

import { SideDrawer } from '@/components/navigation/SideDrawer'
import { CreatePostActionModal } from '@/components/creator/CreatePostActionModal'


async function fetchCreatorStats() {
  try {
    const { data } = await api.get('/creator/stats')
    return data
  } catch {
    // Fallback if endpoint returns empty during initial setup
    return {
      followersCount: 0,
      followersGrowth: '+0 this week',
      subscribersCount: 0,
      subscribersGrowth: '+0 this month',
      monthlyEarnings: 0,
      earningsSubtext: 'Subscriptions + gifts',
      callMinutes: 0,
      callSubtext: 'Voice & video calls',
    }
  }
}

export default function CreatorDashboardScreen() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['creatorStats'],
    queryFn: fetchCreatorStats,
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['creatorStats'] })
    setRefreshing(false)
  }, [queryClient])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.7}
          >
            <Menu size={22} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(fan)/notifications' as any)}
            activeOpacity={0.7}
          >
            <Bell size={19} color="#4A5568" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.8}
          >

            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(user?.name || 'C')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Metrics Cards Stack ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
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
        {/* ── Upload New Post Hero Action Card ── */}
        <TouchableOpacity
          style={styles.uploadHeroCard}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.88}
        >
          <View style={styles.uploadHeroLeft}>
            <View style={styles.uploadHeroIconBox}>
              <Plus size={22} color="#FFFFFF" strokeWidth={2.6} />
            </View>
            <View>
              <Text style={styles.uploadHeroTitle}>Upload New Content</Text>
              <Text style={styles.uploadHeroSub}>
                Photos, Videos, Shorts, Audio, Polls & Stories
              </Text>
            </View>
          </View>
          <View style={styles.uploadHeroPill}>
            <Text style={styles.uploadHeroPillText}>+ Create</Text>
          </View>
        </TouchableOpacity>

        {/* ── Card 1: Total Followers ── */}
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FDEEE9' }]}>
            <Users size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats?.followersCount ?? 0}</Text>
          <Text style={styles.statLabel}>Total Followers</Text>
          <Text style={styles.statSub}>{stats?.followersGrowth ?? '+0 this week'}</Text>
        </View>

        {/* ── Card 2: Total Subscribers ── */}
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#E6F9F0' }]}>
            <UserCheck size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{stats?.subscribersCount ?? 0}</Text>
          <Text style={styles.statLabel}>Total Subscribers</Text>
          <Text style={styles.statSub}>{stats?.subscribersGrowth ?? '+0 this month'}</Text>
        </View>

        {/* ── Card 3: Monthly Earnings ── */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/(creator)/wallet' as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: '#EBF4FF' }]}>
            <DollarSign size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>
            ₦{(stats?.monthlyEarnings ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Monthly Earnings</Text>
          <Text style={styles.statSub}>
            {stats?.earningsSubtext ?? 'Subscriptions + gifts · Tap to view wallet'}
          </Text>
        </TouchableOpacity>


        {/* ── Card 4: Paid Calls & Streams ── */}
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{stats?.callMinutes ?? 0}m</Text>
          <Text style={styles.statLabel}>Paid Call Minutes</Text>
          <Text style={styles.statSub}>{stats?.callSubtext ?? 'Voice & video calls'}</Text>
        </View>

        {/* ── Switch to Fan Mode Banner ── */}
        <TouchableOpacity
          style={styles.switchBanner}
          onPress={() => router.push('/(fan)/feed' as any)}
          activeOpacity={0.85}
        >
          <View style={styles.switchLeft}>
            <View style={styles.switchIcon}>
              <Sparkles size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.switchTitle}>Switch to Fan Mode</Text>
              <Text style={styles.switchSub}>Explore other creators and content</Text>
            </View>
          </View>
          <ArrowRight size={18} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* ── Hamburger Side Drawer ── */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* ── Upload Post Action Modal ── */}
      <CreatePostActionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </View>
  )
}



const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F2EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F6ECE2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  uploadHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    ...Shadows.sm,
  },
  uploadHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  uploadHeroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadHeroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  uploadHeroSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 200,
  },
  uploadHeroPill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  uploadHeroPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  statCard: {

    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  switchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    marginTop: 4,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F6ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  switchSub: {
    fontSize: 12.5,
    color: '#718096',
    marginTop: 2,
  },
})

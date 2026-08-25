// app/(fan)/feed/index.tsx — Main Fan Feed matching screenshot design
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  Search,
  Bell,
  Home,
  Film,
  Radio,
  Sparkles,
  Compass,
} from 'lucide-react-native'
import { api } from '@/lib/api'
import PostCard from '@/components/feed/PostCard'
import { LiveStreamCard, LiveStream } from '@/components/feed/LiveStreamCard'
import { Loader } from '@/components/Loader'
import { Colors, Radius, Shadows } from '@/constants/theme'

const CATEGORIES = [
  { id: 'ALL', label: 'All', emoji: '✨' },
  { id: 'COMEDY', label: 'Comedy', emoji: '😂' },
  { id: 'BEAUTY', label: 'Beauty', emoji: '💄' },
  { id: 'FITNESS', label: 'Fitness', emoji: '💪' },
  { id: 'MUSIC', label: 'Music', emoji: '🎵' },
  { id: 'GAMING', label: 'Gaming', emoji: '🎮' },
  { id: 'TECH', label: 'Tech', emoji: '📱' },
  { id: 'FASHION', label: 'Fashion', emoji: '👗' },
  { id: 'FOOD', label: 'Food', emoji: '🍳' },
  { id: 'TRAVEL', label: 'Travel', emoji: '✈️' },
]

type TopTab = 'feed' | 'shorts' | 'live'

async function fetchFeed(category = 'ALL', page = 1) {
  const { data } = await api.get('/feed', { params: { page, category } })
  return data
}

async function fetchLiveStreams() {
  try {
    const { data } = await api.get('/live')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default function FeedScreen() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TopTab>('feed')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  // Posts Feed query
  const { data: feedData, isLoading: loadingFeed } = useQuery({
    queryKey: ['feed', activeCategory],
    queryFn: () => fetchFeed(activeCategory),
    enabled: activeTab === 'feed',
  })

  // Live Streams query
  const { data: liveData, isLoading: loadingLive } = useQuery<LiveStream[]>({
    queryKey: ['liveStreams'],
    queryFn: fetchLiveStreams,
    refetchInterval: activeTab === 'live' ? 5000 : false, // Poll every 5s on live tab
    enabled: activeTab === 'live',
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    if (activeTab === 'feed') {
      await queryClient.invalidateQueries({ queryKey: ['feed'] })
    } else if (activeTab === 'live') {
      await queryClient.invalidateQueries({ queryKey: ['liveStreams'] })
    }
    setRefreshing(false)
  }, [queryClient, activeTab])

  const posts = feedData?.posts ?? []
  const liveStreams = (liveData ?? []).filter((s) => {
    if (activeCategory === 'ALL') return true
    return s.category?.toUpperCase() === activeCategory
  })

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        {/* Brand Logo */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandLogoN}>N</Text>
          <Text style={styles.brandLogoText}>esora</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(fan)/discover' as any)}
            activeOpacity={0.7}
          >
            <Search size={18} color="#2D3748" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(fan)/notifications' as any)}
            activeOpacity={0.7}
          >
            <Bell size={18} color="#2D3748" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sub-Header Segmented Tabs ── */}
      <View style={styles.subHeaderContainer}>
        <View style={styles.segmentedTabs}>
          {/* Feed Tab */}
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'feed' && styles.segmentTabActive]}
            onPress={() => setActiveTab('feed')}
            activeOpacity={0.8}
          >
            <Home
              size={17}
              color={activeTab === 'feed' ? Colors.primary : '#718096'}
              strokeWidth={activeTab === 'feed' ? 2.3 : 1.8}
            />
            <Text
              style={[styles.segmentLabel, activeTab === 'feed' && styles.segmentLabelActive]}
            >
              Feed
            </Text>
          </TouchableOpacity>

          {/* Shorts Tab */}
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'shorts' && styles.segmentTabActive]}
            onPress={() => router.push('/(fan)/feed/shorts' as any)}
            activeOpacity={0.8}
          >
            <Film size={17} color="#718096" strokeWidth={1.8} />
            <Text style={styles.segmentLabel}>Shorts</Text>
          </TouchableOpacity>

          {/* Live Tab */}
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'live' && styles.segmentTabActive]}
            onPress={() => setActiveTab('live')}
            activeOpacity={0.8}
          >
            <Radio
              size={17}
              color={activeTab === 'live' ? '#DC2626' : '#718096'}
              strokeWidth={activeTab === 'live' ? 2.3 : 1.8}
            />
            <Text
              style={[
                styles.segmentLabel,
                activeTab === 'live' && { color: '#DC2626', fontWeight: '700' },
              ]}
            >
              Live
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Category Pills (Horizontal Scroll) ── */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* ── Main Feed / Live Body ── */}
      {activeTab === 'live' ? (
        loadingLive && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={{ marginTop: 10, color: '#718096', fontSize: 13.5 }}>
              Checking active live broadcasts…
            </Text>
          </View>
        ) : (
          <FlatList
            data={liveStreams}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LiveStreamCard stream={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#DC2626"
                colors={['#DC2626']}
              />
            }
            contentContainerStyle={
              liveStreams.length === 0
                ? styles.emptyLiveContainer
                : styles.listContent
            }
            ListEmptyComponent={
              <View style={styles.emptyLiveBox}>
                <View style={styles.emptyLiveIconWrap}>
                  <Radio size={36} color="#DC2626" strokeWidth={2} />
                </View>
                <Text style={styles.emptyLiveTitle}>No one's live right now</Text>
                <Text style={styles.emptyLiveSub}>
                  When creators you follow go live, they'll show up here.
                </Text>
                <TouchableOpacity
                  style={styles.emptyLiveBtn}
                  onPress={() => router.push('/(fan)/discover' as any)}
                  activeOpacity={0.85}
                >
                  <Compass size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyLiveBtnText}>Explore Creators</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        /* Regular Feed */
        loadingFeed && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Loader fullscreen={false} message="Loading posts…" />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostCard post={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            contentContainerStyle={
              posts.length === 0 ? styles.emptyListContainer : styles.listContent
            }
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyTitle}>No posts yet in this category.</Text>
                <Text style={styles.emptySubtitle}>
                  Follow more creators to fill your feed.
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  )
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3EFEA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandLogoN: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandLogoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8A3B14',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  subHeaderContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  segmentedTabs: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 12,
    padding: 3.5,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  segmentTabActive: {
    backgroundColor: '#F8ECE2',
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  segmentLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  categoriesWrapper: {
    paddingVertical: 12,
    backgroundColor: '#F3EFEA',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 110,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#718096',
    textAlign: 'center',
  },
  /* ── Live Empty State (matches screenshot) ── */
  emptyLiveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyLiveBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyLiveIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyLiveTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyLiveSub: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  emptyLiveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

// app/(fan)/discover/index.tsx — Discover & Recommended Creators Screen
import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  Search,
  CheckCircle2,
  Sparkles,
  Users,
  UserCheck,
  TrendingUp,
  X,
  Compass,
} from 'lucide-react-native'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

const DISCOVER_CATEGORIES = [
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

export default function DiscoverScreen() {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchText, setSearchText] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  // Fetch Recommended Creators (backed by Redis cache & personalized affinity)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['discover', selectedCategory, searchText],
    queryFn: async () => {
      const params: any = {}
      if (selectedCategory !== 'ALL') params.category = selectedCategory
      if (searchText.trim()) params.search = searchText.trim()

      const res = await api.get('/discover', { params })
      const list = res.data
      return Array.isArray(list) ? list : (list?.creators ?? [])
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['discover'] })
    setRefreshing(false)
  }, [queryClient])

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (creatorId: string) => {
      const res = await api.post(`/creators/${creatorId}/follow`)
      return { creatorId, data: res.data }
    },
    onMutate: async (creatorId) => {
      setFollowingMap((prev) => ({ ...prev, [creatorId]: !prev[creatorId] }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fanFollowedCreators'] })
    },
    onError: (_err, creatorId) => {
      // Revert on error
      setFollowingMap((prev) => ({ ...prev, [creatorId]: !prev[creatorId] }))
    },
  })

  const creators = useMemo(() => (Array.isArray(data) ? data : []), [data])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Compass size={22} color={Colors.primary} />
            <Text style={styles.headerTitle}>Discover</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Recommended creators based on your interests
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={17} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators, categories, or tags..."
            placeholderTextColor="#A0AEC0"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={16} color="#718096" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {DISCOVER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
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

      {/* ── Creator Cards Grid ── */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding creators for you…</Text>
        </View>
      ) : (
        <FlatList
          data={creators}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={
            creators.length === 0
              ? styles.emptyContainer
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const isFollowing = followingMap[item.id] ?? false
            const firstCategory = item.creatorCategories?.[0]?.category || null
            const startingPrice = item.subscriptionPlans?.[0]?.price
              ? Number(item.subscriptionPlans[0].price)
              : null

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: '/(fan)/profile/[username]',
                    params: { username: item.handle || item.id },
                  })
                }
              >
                {/* Banner / Header accent */}
                <View style={styles.cardBanner}>
                  {item.bannerImage ? (
                    <Image
                      source={{ uri: item.bannerImage }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  ) : (
                    <View style={styles.cardBannerFallback} />
                  )}
                  {firstCategory && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {firstCategory}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  {item.user?.image ? (
                    <Image
                      source={{ uri: item.user.image }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {(item.displayName || 'C')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {item.isVerified && (
                    <View style={styles.verifiedDot}>
                      <CheckCircle2 size={13} color="#3B82F6" />
                    </View>
                  )}
                </View>

                {/* Name & Handle */}
                <Text style={styles.creatorName} numberOfLines={1}>
                  {item.displayName || 'Creator'}
                </Text>
                <Text style={styles.creatorHandle} numberOfLines={1}>
                  @{item.handle || 'creator'}
                </Text>

                {/* Bio Snippet */}
                {item.bio ? (
                  <Text style={styles.bio} numberOfLines={2}>
                    {item.bio}
                  </Text>
                ) : (
                  <Text style={styles.bioPlaceholder}>
                    Creative content creator on NESORA
                  </Text>
                )}

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Users size={12} color="#718096" />
                    <Text style={styles.statText}>
                      {(item.followersCount ?? 0).toLocaleString()}
                    </Text>
                  </View>
                  {startingPrice && (
                    <View style={styles.pricePill}>
                      <Text style={styles.pricePillText}>
                        ₦{startingPrice.toLocaleString()}/mo
                      </Text>
                    </View>
                  )}
                </View>

                {/* Follow / View Button */}
                <TouchableOpacity
                  style={[
                    styles.followBtn,
                    isFollowing && styles.followBtnActive,
                  ]}
                  onPress={() => followMutation.mutate(item.id)}
                  activeOpacity={0.8}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.followBtnText}>Following</Text>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.followBtnText}>Follow</Text>
                    </>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconBox}>
                <Compass size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No creators found</Text>
              <Text style={styles.emptySub}>
                {searchText
                  ? `No creators matching "${searchText}". Try searching for other tags or categories.`
                  : 'Check back soon as more creators join NESORA!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8E1',
  },
  headerTop: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#718096',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1EC',
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A202C',
    padding: 0,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 4,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    fontSize: 12,
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
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE5DE',
    ...Shadows.sm,
    paddingBottom: 12,
    alignItems: 'center',
  },
  cardBanner: {
    width: '100%',
    height: 48,
    backgroundColor: '#FDEEE9',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 6,
  },
  cardBannerFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F6ECE2',
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  avatarWrap: {
    marginTop: -24,
    marginBottom: 6,
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#F4F1EC',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  creatorHandle: {
    fontSize: 11.5,
    color: '#718096',
    marginBottom: 6,
  },
  bio: {
    fontSize: 11.5,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 10,
    marginBottom: 8,
    minHeight: 30,
  },
  bioPlaceholder: {
    fontSize: 11.5,
    color: '#A0AEC0',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 10,
    marginBottom: 8,
    minHeight: 30,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  pricePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pricePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#92400E',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    width: '88%',
  },
  followBtnActive: {
    backgroundColor: '#2D3748',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
})

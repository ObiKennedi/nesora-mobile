// app/(creator)/content/index.tsx — Creator Content Management Screen matching design
import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native'
import {
  Menu,
  Bell,
  Plus,
  PenLine,
  ChevronDown,
  Sparkles,
  Heart,
  MessageCircle,
  Eye,
  Lock,
  Globe,
  Users,
  Film,
  Camera,
  Mic,
  BarChart2,
  FileText,
} from 'lucide-react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { CreatePostActionModal } from '@/components/creator/CreatePostActionModal'
import { SideDrawer } from '@/components/navigation/SideDrawer'
import { Colors, Radius, Shadows } from '@/constants/theme'

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFTS' | 'SCHEDULED'
type TypeFilter = 'ALL' | 'PHOTO' | 'VIDEO' | 'SHORTS' | 'AUDIO' | 'TEXT' | 'POLL' | 'STORY'

export default function CreatorContentScreen() {
  const { user } = useAuthStore()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [initialPostType, setInitialPostType] = useState<string | undefined>(undefined)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)

  // Fetch Creator Posts
  const { data: contentData, isLoading, refetch } = useQuery({
    queryKey: ['myCreatorPosts'],
    queryFn: async () => {
      const res = await api.get('/posts/creator/mine')
      return res.data
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const rawPosts = contentData?.posts ?? []

  const filteredPosts = useMemo(() => {
    return rawPosts.filter((p: any) => {
      if (typeFilter !== 'ALL' && p.type !== typeFilter) return false
      return true
    })
  }, [rawPosts, typeFilter])

  const handleOpenCreateModal = (type?: string) => {
    setInitialPostType(type)
    setCreateModalVisible(true)
  }

  const renderPostCard = ({ item }: { item: any }) => {
    const isMedia = item.mediaUrls && item.mediaUrls.length > 0
    const mediaUrl = isMedia ? item.mediaUrls[0] : item.thumbnailUrl
    const typeLabel = item.type || 'PHOTO'

    return (
      <View style={styles.postCard}>
        <View style={styles.postCardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <View style={styles.postCardHeaderRight}>
            <View style={styles.accessPill}>
              {item.accessLevel === 'SUBSCRIBERS_ONLY' ? (
                <Lock size={11} color="#D97706" />
              ) : (
                <Globe size={11} color="#10B981" />
              )}
              <Text style={styles.accessPillText}>
                {item.accessLevel === 'SUBSCRIBERS_ONLY' ? 'Subscribers' : 'Public'}
              </Text>
            </View>
            <Text style={styles.postDate}>
              {item.createdAt
                ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                : ''}
            </Text>
          </View>
        </View>

        {mediaUrl && (
          <Image source={{ uri: mediaUrl }} style={styles.postImage} resizeMode="cover" />
        )}

        {item.title ? (
          <Text style={styles.postTitle} numberOfLines={2}>
            {item.title}
          </Text>
        ) : null}

        {item.body ? (
          <Text style={styles.postBody} numberOfLines={3}>
            {item.body}
          </Text>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Eye size={14} color="#64748B" />
            <Text style={styles.statText}>{item.viewCount ?? 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Heart size={14} color="#64748B" />
            <Text style={styles.statText}>{item.likeCount ?? 0}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={14} color="#64748B" />
            <Text style={styles.statText}>{item.commentCount ?? 0}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header (Hamburger, Content — Feed, Bell, Avatar) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Menu size={22} color="#1A202C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Content — Feed</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(fan)/notifications' as any)}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#1A202C" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.8}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(user?.name || 'C')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
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
        {/* ── Top Add Story Section (Dotted Card matching screenshot) ── */}
        <View style={styles.storySection}>
          <TouchableOpacity
            style={styles.addStoryCard}
            onPress={() => handleOpenCreateModal('STORY')}
            activeOpacity={0.8}
          >
            <View style={styles.addStoryInner}>
              <Plus size={24} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <Text style={styles.addStoryLabel}>Add Story</Text>
        </View>

        {/* ── Posts Count ── */}
        <Text style={styles.postsCountText}>{filteredPosts.length} posts</Text>

        {/* ── Segmented Tabs: All | Published | Drafts | Scheduled ── */}
        <View style={styles.segmentedBar}>
          <TouchableOpacity
            style={[styles.segTab, statusFilter === 'ALL' && styles.segTabActive]}
            onPress={() => setStatusFilter('ALL')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segTabText,
                statusFilter === 'ALL' && styles.segTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segTab, statusFilter === 'PUBLISHED' && styles.segTabActive]}
            onPress={() => setStatusFilter('PUBLISHED')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segTabText,
                statusFilter === 'PUBLISHED' && styles.segTabTextActive,
              ]}
            >
              Published
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segTab, statusFilter === 'DRAFTS' && styles.segTabActive]}
            onPress={() => setStatusFilter('DRAFTS')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segTabText,
                statusFilter === 'DRAFTS' && styles.segTabTextActive,
              ]}
            >
              Drafts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segTab, statusFilter === 'SCHEDULED' && styles.segTabActive]}
            onPress={() => setStatusFilter('SCHEDULED')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segTabText,
                statusFilter === 'SCHEDULED' && styles.segTabTextActive,
              ]}
            >
              Scheduled
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Dropdown: All Types ▾ ── */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setTypeDropdownOpen(!typeDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownBtnText}>
              {typeFilter === 'ALL'
                ? 'All Types'
                : typeFilter.charAt(0) + typeFilter.slice(1).toLowerCase()}
            </Text>
            <ChevronDown size={16} color="#718096" />
          </TouchableOpacity>
        </View>

        {typeDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {[
              { label: 'All Types', val: 'ALL' },
              { label: 'Photos', val: 'PHOTO' },
              { label: 'Videos', val: 'VIDEO' },
              { label: 'Shorts & Reels', val: 'SHORTS' },
              { label: 'Audio & Music', val: 'AUDIO' },
              { label: 'Articles & Text', val: 'TEXT' },
              { label: 'Community Polls', val: 'POLL' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.val}
                style={[
                  styles.dropdownMenuItem,
                  typeFilter === opt.val && styles.dropdownMenuItemActive,
                ]}
                onPress={() => {
                  setTypeFilter(opt.val as TypeFilter)
                  setTypeDropdownOpen(false)
                }}
              >
                <Text
                  style={[
                    styles.dropdownMenuText,
                    typeFilter === opt.val && styles.dropdownMenuTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Create Post Button (Dark button with pencil icon) ── */}
        <TouchableOpacity
          style={styles.createPostBtn}
          onPress={() => handleOpenCreateModal()}
          activeOpacity={0.85}
        >
          <PenLine size={16} color="#FFFFFF" strokeWidth={2} style={{ marginRight: 8 }} />
          <Text style={styles.createPostBtnText}>Create Post</Text>
        </TouchableOpacity>

        {/* ── Content List or Empty State ── */}
        {isLoading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <PenLine size={32} color="#CBD5E1" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>Create your first post to get started</Text>
          </View>
        ) : (
          <View style={styles.postList}>
            {filteredPosts.map((post: any) => (
              <View key={post.id}>{renderPostCard({ item: post })}</View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Side Navigation Drawer ── */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* ── Create Post Action Modal ── */}
      <CreatePostActionModal
        visible={createModalVisible}
        initialType={initialPostType}
        onClose={() => {
          setCreateModalVisible(false)
          setInitialPostType(undefined)
          refetch()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F1EC',
  },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarBtn: {
    position: 'relative',
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  headerAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  /* ── Add Story Dotted Card ── */
  storySection: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  addStoryCard: {
    width: 90,
    height: 125,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4CFC6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addStoryInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginLeft: 14,
  },
  /* Posts count */
  postsCountText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 12,
  },
  /* Segmented Bar */
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DF',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  segTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segTabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  segTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#718096',
  },
  segTabTextActive: {
    color: '#1A202C',
    fontWeight: '700',
  },
  /* Filter Dropdown */
  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  dropdownBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -8,
    marginBottom: 14,
    ...Shadows.sm,
  },
  dropdownMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#FFF7ED',
  },
  dropdownMenuText: {
    fontSize: 13,
    color: '#4A5568',
  },
  dropdownMenuTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  /* Create Post CTA Button */
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 32,
    ...Shadows.sm,
  },
  createPostBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  /* Empty State */
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  /* Post List */
  postList: {
    gap: 12,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...Shadows.sm,
  },
  postCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  postCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accessPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  postDate: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  postBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
})

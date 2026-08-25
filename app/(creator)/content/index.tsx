// app/(creator)/content/index.tsx — Creator Content Management & Post Upload
import React, { useState, useCallback } from 'react'
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
} from 'react-native'
import {
  Plus,
  Image as ImageIcon,
  Video,
  Film,
  Mic,
  Type,
  BarChart2,
  Heart,
  MessageCircle,
  Eye,
  Sparkles,
} from 'lucide-react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { CreatePostActionModal } from '@/components/creator/CreatePostActionModal'
import { Colors, Radius, Shadows } from '@/constants/theme'

export default function CreatorContentScreen() {
  const queryClient = useQueryClient()
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

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

  const posts = contentData?.posts ?? []

  const renderPostItem = ({ item }: { item: any }) => {
    const isMedia = item.mediaUrls && item.mediaUrls.length > 0
    const mediaUrl = isMedia ? item.mediaUrls[0] : item.thumbnailUrl
    const typeLabel = item.type || 'PHOTO'

    return (
      <View style={styles.postCard}>
        <View style={styles.postCardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <Text style={styles.postDate}>
            {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : ''}
          </Text>
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Content</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.85}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.createBtnText}>Upload Post</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconWrap}>
            <Sparkles size={32} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No posts published yet</Text>
          <Text style={styles.emptySubtitle}>
            Publish exclusive photos, videos, audio tracks, and updates for your subscribers.
          </Text>

          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyActionBtnText}>Create Your First Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* ── Create Post Dropdown / Action Modal ── */}
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    gap: 6,
    ...Shadows.sm,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F6ECE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  emptyActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
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

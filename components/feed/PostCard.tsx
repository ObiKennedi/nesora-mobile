// components/feed/PostCard.tsx — Beautiful post card for fan feed
import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import {
  Heart,
  MessageCircle,
  Share2,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

type Post = {
  id: string
  type: string
  title: string | null
  body: string | null
  mediaUrls: string[]
  thumbnailUrl: string | null
  hasAccess: boolean
  likeCount: number
  commentCount: number
  isLiked: boolean
  lockReason: string | null
  publishedAt: string | null
  creator: {
    id: string
    displayName: string
    handle: string | null
    image: string | null
    isVerified: boolean
  }
}

export default function PostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)

  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : ''
  const isLocked = !post.hasAccess

  const handleLike = async () => {
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    try {
      await api.post(`/posts/${post.id}/like`)
    } catch {
      // revert on failure
      setIsLiked(!nextLiked)
      setLikeCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1))
    }
  }

  return (
    <View style={styles.card}>
      {/* ── Creator Header ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={() =>
          router.push({
            pathname: '/(fan)/profile/[username]',
            params: { username: post.creator.handle ?? post.creator.id },
          })
        }
        activeOpacity={0.8}
      >
        {post.creator.image ? (
          <Image source={{ uri: post.creator.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {(post.creator.displayName || 'C')[0].toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.creatorMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{post.creator.displayName}</Text>
            {post.creator.isVerified && (
              <CheckCircle2 size={13} color="#3B82F6" style={{ marginLeft: 3 }} />
            )}
          </View>
          <Text style={styles.time}>
            {post.creator.handle ? `@${post.creator.handle} · ` : ''}
            {timeAgo}
          </Text>
        </View>
      </TouchableOpacity>

      {/* ── Post Content ── */}
      {post.title && <Text style={styles.title}>{post.title}</Text>}
      {post.body && !isLocked && <Text style={styles.body}>{post.body}</Text>}

      {/* ── Media ── */}
      {post.mediaUrls.length > 0 && !isLocked && (
        <Image
          source={{ uri: post.mediaUrls[0] }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      {/* ── Locked / Gated Overlay ── */}
      {isLocked && (
        <View style={styles.lockedContainer}>
          {post.thumbnailUrl && (
            <Image
              source={{ uri: post.thumbnailUrl }}
              style={[StyleSheet.absoluteFillObject, styles.lockedBg]}
              blurRadius={25}
            />
          )}
          <View style={styles.lockedContent}>
            <View style={styles.lockIconCircle}>
              <Lock size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.lockTitle}>
              {post.lockReason === 'FOLLOWERS_ONLY'
                ? 'Follow to unlock content'
                : post.lockReason === 'SUBSCRIBERS_ONLY'
                ? 'Subscriber Exclusive'
                : 'NESORA Plus Content'}
            </Text>
            <Text style={styles.lockSub}>
              {post.lockReason === 'FOLLOWERS_ONLY'
                ? 'Follow this creator to view this post.'
                : 'Join this creator’s plan or subscribe to NESORA Plus.'}
            </Text>
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={() =>
                router.push({
                  pathname: '/(fan)/profile/[username]',
                  params: { username: post.creator.handle ?? post.creator.id },
                })
              }
              activeOpacity={0.85}
            >
              <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.unlockBtnText}>Unlock Content</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Action Bar ── */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem} onPress={handleLike} activeOpacity={0.7}>
          <Heart
            size={18}
            color={isLiked ? '#EF4444' : '#64748B'}
            fill={isLiked ? '#EF4444' : 'transparent'}
          />
          <Text style={[styles.actionCount, isLiked && { color: '#EF4444', fontWeight: '700' }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() =>
            router.push({
              pathname: '/(fan)/profile/[username]',
              params: { username: post.creator.handle ?? post.creator.id },
            })
          }
          activeOpacity={0.7}
        >
          <MessageCircle size={18} color="#64748B" />
          <Text style={styles.actionCount}>{post.commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <Share2 size={18} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE5DE',
    ...Shadows.sm,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F1EC',
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FDEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  creatorMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1A202C',
  },
  time: {
    fontSize: 11.5,
    color: '#718096',
    marginTop: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  media: {
    width: '100%',
    height: 280,
    backgroundColor: '#F1F5F9',
  },
  lockedContainer: {
    height: 200,
    backgroundColor: '#1E293B',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lockedBg: {
    opacity: 0.35,
  },
  lockedContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 6,
  },
  lockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  lockSub: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 6,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  unlockBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
})

// components/feed/PostCard.tsx

import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'

type Post = {
  id: string; type: string; title: string | null; body: string | null
  mediaUrls: string[]; thumbnailUrl: string | null; hasAccess: boolean
  likeCount: number; commentCount: number; isLiked: boolean; lockReason: string | null
  publishedAt: string | null
  creator: { id: string; displayName: string; handle: string | null; image: string | null; isVerified: boolean }
}

export default function PostCard({ post }: { post: Post }) {
  const timeAgo = post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : ''
  const isLocked = !post.hasAccess

  const handleLike = async () => {
    await api.post(`/posts/${post.id}/like`)
  }

  return (
    <View style={s.card}>
      {/* Creator header */}
      <TouchableOpacity
        style={s.header}
        onPress={() => router.push({ pathname: '/(fan)/profile/[username]', params: { username: post.creator.handle ?? post.creator.id } })}
      >
        <Image
          source={{ uri: post.creator.image ?? 'https://via.placeholder.com/40' }}
          style={s.avatar}
        />
        <View>
          <Text style={s.displayName}>
            {post.creator.displayName}
            {post.creator.isVerified ? ' ✓' : ''}
          </Text>
          <Text style={s.time}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>

      {/* Content */}
      {post.title && <Text style={s.title}>{post.title}</Text>}
      {post.body && !isLocked && <Text style={s.body}>{post.body}</Text>}

      {/* Media */}
      {post.mediaUrls.length > 0 && !isLocked && (
        <Image source={{ uri: post.mediaUrls[0] }} style={s.media} resizeMode="cover" />
      )}

      {/* Locked overlay */}
      {isLocked && (
        <View style={s.locked}>
          {post.thumbnailUrl && (
            <Image source={{ uri: post.thumbnailUrl }} style={[StyleSheet.absoluteFillObject, s.lockedBg]} blurRadius={20} />
          )}
          <View style={s.lockedContent}>
            <Text style={s.lockEmoji}>🔒</Text>
            <Text style={s.lockText}>
              {post.lockReason === 'FOLLOWERS_ONLY' ? 'Follow to unlock'
                : post.lockReason === 'SUBSCRIBERS_ONLY' ? 'Subscribe to unlock'
                : 'Content locked'}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.action} onPress={handleLike}>
          <Text style={s.actionText}>{post.isLiked ? '❤️' : '🤍'} {post.likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action}>
          <Text style={s.actionText}>💬 {post.commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action}>
          <Text style={s.actionText}>🔗 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1a1a1a', paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#222' },
  displayName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  time: { color: '#666', fontSize: 12, marginTop: 2 },
  title: { color: '#fff', fontWeight: '700', fontSize: 17, paddingHorizontal: 16, marginBottom: 8 },
  body: { color: '#ccc', fontSize: 15, paddingHorizontal: 16, marginBottom: 12, lineHeight: 22 },
  media: { width: '100%', height: 280 },
  locked: { height: 200, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  lockedBg: { opacity: 0.4 },
  lockedContent: { alignItems: 'center', gap: 8 },
  lockEmoji: { fontSize: 32 },
  lockText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  actions: { flexDirection: 'row', gap: 24, paddingHorizontal: 16, paddingTop: 12 },
  action: {},
  actionText: { color: '#aaa', fontSize: 14 },
})

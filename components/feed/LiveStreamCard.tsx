// components/feed/LiveStreamCard.tsx — Live stream card for fan dashboard
import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import {
  Radio,
  Eye,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native'
import { Colors, Radius, Shadows } from '@/constants/theme'

export type LiveStream = {
  id: string
  title: string
  thumbnailUrl?: string | null
  viewerCount?: number
  category?: string | null
  startedAt?: string | null
  creator: {
    id: string
    displayName: string
    handle?: string | null
    isVerified?: boolean
    user?: {
      image: string | null
    }
  }
}

export function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const { creator, title, thumbnailUrl, viewerCount = 0, category } = stream
  const creatorImage = creator.user?.image

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        router.push({
          pathname: '/(fan)/profile/[username]',
          params: { username: creator.handle || creator.id },
        })
      }}
    >
      {/* ── Top Media / Thumbnail Area ── */}
      <View style={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Radio size={42} color="rgba(255,255,255,0.7)" />
            <Text style={styles.thumbnailFallbackText}>Live Broadcast</Text>
          </View>
        )}

        {/* Live Status Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>

        {/* Viewer Count Badge */}
        <View style={styles.viewerBadge}>
          <Eye size={12} color="#FFFFFF" />
          <Text style={styles.viewerBadgeText}>
            {(viewerCount ?? 1).toLocaleString()} watching
          </Text>
        </View>
      </View>

      {/* ── Creator Info & Details ── */}
      <View style={styles.infoContainer}>
        <View style={styles.creatorRow}>
          {/* Avatar with Live Border */}
          <View style={styles.avatarBorder}>
            {creatorImage ? (
              <Image source={{ uri: creatorImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(creator.displayName || 'C')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Names & Handle */}
          <View style={styles.creatorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName} numberOfLines={1}>
                {creator.displayName}
              </Text>
              {creator.isVerified && (
                <CheckCircle2 size={13} color="#3B82F6" style={{ marginLeft: 3 }} />
              )}
            </View>
            {creator.handle && (
              <Text style={styles.handle} numberOfLines={1}>
                @{creator.handle}
              </Text>
            )}
          </View>

          {/* Category Tag */}
          {category && (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{category}</Text>
            </View>
          )}
        </View>

        {/* Stream Title */}
        <Text style={styles.streamTitle} numberOfLines={2}>
          {title || `Live with ${creator.displayName}`}
        </Text>

        {/* Watch Live Action Button */}
        <TouchableOpacity
          style={styles.watchBtn}
          onPress={() => {
            router.push({
              pathname: '/(fan)/profile/[username]',
              params: { username: creator.handle || creator.id },
            })
          }}
          activeOpacity={0.85}
        >
          <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.watchBtnText}>Watch Live Stream</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAE5DE',
    ...Shadows.sm,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#1A202C',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  thumbnailFallbackText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    gap: 5,
  },
  viewerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 14,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#DC2626',
    padding: 1.5,
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#F4F1EC',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  handle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 1,
  },
  categoryPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  streamTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#2D3748',
    lineHeight: 20,
    marginBottom: 12,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  watchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

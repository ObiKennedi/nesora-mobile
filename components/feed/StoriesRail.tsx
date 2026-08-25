// components/feed/StoriesRail.tsx — Stories & Live Rail at top of Feed
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Plus, Radio } from 'lucide-react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { StoryViewerModal, StoryItem } from './StoryViewerModal'
import { Colors } from '@/constants/theme'

type LiveStream = {
  id: string
  title: string
  creator: {
    id: string
    displayName: string
    handle?: string | null
    user?: { image?: string | null }
  }
}

type Props = {
  onAddStoryPress?: () => void
}

export function StoriesRail({ onAddStoryPress }: Props) {
  const { user } = useAuthStore()
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null)
  const [viewerVisible, setViewerVisible] = useState(false)

  // Fetch Stories
  const { data: storiesData } = useQuery<StoryItem[]>({
    queryKey: ['storiesRail'],
    queryFn: async () => {
      try {
        const res = await api.get('/stories')
        return Array.isArray(res.data) ? res.data : []
      } catch {
        return []
      }
    },
  })

  // Fetch Live Streams
  const { data: liveData } = useQuery<LiveStream[]>({
    queryKey: ['liveRail'],
    queryFn: async () => {
      try {
        const res = await api.get('/live')
        return Array.isArray(res.data) ? res.data : []
      } catch {
        return []
      }
    },
    refetchInterval: 10000,
  })

  const stories = storiesData ?? []
  const liveStreams = liveData ?? []

  const handleOpenStory = (story: StoryItem) => {
    setSelectedStory(story)
    setViewerVisible(true)
  }

  const handleOpenLive = (stream: LiveStream) => {
    router.push(`/(fan)/feed` as any)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 1. Your Story / Add Story Bubble ── */}
        <TouchableOpacity
          style={styles.bubbleItem}
          onPress={onAddStoryPress}
          activeOpacity={0.8}
        >
          <View style={styles.addStoryRing}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {(user?.name || 'Y')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.plusIconBadge}>
              <Plus size={13} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.bubbleName} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* ── 2. Live Broadcasts ── */}
        {liveStreams.map((stream) => {
          const creatorName =
            stream.creator.displayName || stream.creator.handle || 'Creator'
          const imgUrl = stream.creator.user?.image

          return (
            <TouchableOpacity
              key={`live-${stream.id}`}
              style={styles.bubbleItem}
              onPress={() => handleOpenLive(stream)}
              activeOpacity={0.8}
            >
              <View style={styles.liveRing}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: '#DC2626' }]}>
                    <Text style={styles.avatarFallbackText}>
                      {creatorName[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.bubbleName} numberOfLines={1}>
                {creatorName}
              </Text>
            </TouchableOpacity>
          )
        })}

        {/* ── 3. Creator Stories ── */}
        {stories.map((story) => {
          const creatorName =
            story.creator?.displayName || story.creator?.handle || 'Story'
          const imgUrl = story.creator?.user?.image
          const isViewed = story.viewed

          return (
            <TouchableOpacity
              key={`story-${story.id}`}
              style={styles.bubbleItem}
              onPress={() => handleOpenStory(story)}
              activeOpacity={0.8}
            >
              <View style={[styles.storyRing, isViewed ? styles.storyRingViewed : styles.storyRingUnread]}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {creatorName[0].toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.bubbleName} numberOfLines={1}>
                {creatorName}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── Story Viewer Modal ── */}
      <StoryViewerModal
        visible={viewerVisible}
        story={selectedStory}
        storiesList={stories}
        onClose={() => {
          setViewerVisible(false)
          setSelectedStory(null)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
    alignItems: 'center',
  },
  bubbleItem: {
    alignItems: 'center',
    width: 68,
  },
  addStoryRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  plusIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    borderWidth: 2.5,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRingUnread: {
    borderWidth: 2.5,
    borderColor: '#EA580C',
  },
  storyRingViewed: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  bubbleName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },
})

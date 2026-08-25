// components/feed/StoryViewerModal.tsx — Full-screen 24h Story Viewer
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native'
import { X, Heart, MessageSquare, Send } from 'lucide-react-native'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const STORY_DURATION = 5000 // 5 seconds per story

export type StoryItem = {
  id: string
  mediaUrl?: string | null
  mediaType?: 'PHOTO' | 'VIDEO' | 'TEXT' | null
  caption?: string | null
  createdAt?: string
  viewed?: boolean
  creator?: {
    id: string
    displayName: string
    handle?: string | null
    user?: { image?: string | null }
  }
}

type Props = {
  visible: boolean
  story: StoryItem | null
  storiesList?: StoryItem[]
  onClose: () => void
}

export function StoryViewerModal({ visible, story, storiesList = [], onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressAnim = useRef(new Animated.Value(0)).current

  const activeStories = storiesList.length > 0 ? storiesList : story ? [story] : []
  const currentStory = activeStories[currentIndex] || story

  useEffect(() => {
    if (!visible || !currentStory) return

    // Record story view
    if (currentStory.id) {
      api.post(`/stories/${currentStory.id}/view`).catch(() => {})
    }

    // Reset and start animation
    progressAnim.setValue(0)
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    })

    anim.start(({ finished }) => {
      if (finished) {
        if (currentIndex < activeStories.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          onClose()
        }
      }
    })

    return () => {
      anim.stop()
    }
  }, [visible, currentIndex, currentStory?.id])

  if (!visible || !currentStory) return null

  const handleTap = (evt: any) => {
    const touchX = evt.nativeEvent.locationX
    if (touchX < SCREEN_WIDTH * 0.3) {
      // Tap Left: Previous story
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }
    } else {
      // Tap Right: Next story
      if (currentIndex < activeStories.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        onClose()
      }
    }
  }

  const creatorName =
    currentStory.creator?.displayName || currentStory.creator?.handle || 'Creator Story'
  const creatorImage = currentStory.creator?.user?.image
  const mediaUrl =
    currentStory.mediaUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Background / Story Media */}
        <Image
          source={{ uri: mediaUrl }}
          style={styles.storyMedia}
          resizeMode="cover"
        />

        {/* Gradient Overlay for Text Readability */}
        <View style={styles.topGradient} />
        <View style={styles.bottomGradient} />

        {/* Interactive Tap Zone */}
        <TouchableWithoutFeedback onPress={handleTap}>
          <View style={styles.touchArea} />
        </TouchableWithoutFeedback>

        {/* Top Controls & Progress Bar */}
        <SafeAreaView style={styles.topBar}>
          {/* Progress Indicators */}
          <View style={styles.progressRow}>
            {activeStories.map((_, i) => {
              let width: any = '0%'
              if (i < currentIndex) width = '100%'
              else if (i === currentIndex) {
                width = progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })
              }
              return (
                <View key={i} style={styles.progressBarTrack}>
                  <Animated.View style={[styles.progressBarFill, { width }]} />
                </View>
              )
            })}
          </View>

          {/* Creator Profile Header */}
          <View style={styles.creatorHeader}>
            <View style={styles.creatorInfo}>
              {creatorImage ? (
                <Image source={{ uri: creatorImage }} style={styles.creatorAvatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {creatorName[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.creatorName}>{creatorName}</Text>
                <Text style={styles.timeAgo}>
                  {currentStory.createdAt
                    ? formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })
                    : 'Just now'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Caption (if present) */}
        {currentStory.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentStory.caption}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  storyMedia: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  touchArea: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11.5,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 34,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
})

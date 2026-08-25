// components/creator/CreatePostActionModal.tsx — Creator Upload Posts Dropdown & Composer Modal
import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native'
import {
  X,
  Image as ImageIcon,
  Video,
  Film,
  Mic,
  Type,
  BarChart2,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Globe,
  Users,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '@/lib/api'
import { Colors, Radius, Shadows } from '@/constants/theme'

const SCREEN_HEIGHT = Dimensions.get('window').height

export type PostTypeOption = 'PHOTO' | 'VIDEO' | 'SHORTS' | 'AUDIO' | 'TEXT' | 'POLL' | 'STORY' | 'LIVE'

const POST_TYPES: {
  type: PostTypeOption
  label: string
  desc: string
  icon: any
  color: string
  bg: string
}[] = [
  {
    type: 'PHOTO',
    label: 'Photo Post',
    desc: 'Share high-res photos and galleries with captions.',
    icon: ImageIcon,
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  {
    type: 'VIDEO',
    label: 'Video Post',
    desc: 'Upload full videos with thumbnails for fans.',
    icon: Video,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    type: 'SHORTS',
    label: 'Shorts / Reel',
    desc: 'Share 9:16 vertical short-form video clips.',
    icon: Film,
    color: '#9333EA',
    bg: '#FAF5FF',
  },
  {
    type: 'AUDIO',
    label: 'Audio & Music',
    desc: 'Upload songs, podcasts, voice notes & beats.',
    icon: Mic,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    type: 'TEXT',
    label: 'Text & Thought',
    desc: 'Publish written articles, news, and updates.',
    icon: Type,
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    type: 'POLL',
    label: 'Community Poll',
    desc: 'Ask your fans questions with interactive voting.',
    icon: BarChart2,
    color: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    type: 'STORY',
    label: '24h Story',
    desc: 'Share a disappearing story at the top of the feed.',
    icon: Clock,
    color: '#E11D48',
    bg: '#FFF1F2',
  },
  {
    type: 'LIVE',
    label: 'Go Live',
    desc: 'Start an interactive live video broadcast now.',
    icon: Radio,
    color: '#DC2626',
    bg: '#FEE2E2',
  },
]

type Props = {
  visible: boolean
  onClose: () => void
}

export function CreatePostActionModal({ visible, onClose }: Props) {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<PostTypeOption | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [accessLevel, setAccessLevel] = useState<'PUBLIC' | 'FOLLOWERS_ONLY' | 'SUBSCRIBERS_ONLY'>('PUBLIC')
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2'])

  const resetForm = () => {
    setSelectedType(null)
    setTitle('')
    setBody('')
    setMediaUrl('')
    setThumbnailUrl('')
    setAccessLevel('PUBLIC')
    setPollOptions(['Option 1', 'Option 2'])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Publish Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedType) return

      if (selectedType === 'LIVE') {
        // Start or schedule live stream
        const res = await api.post('/live', {
          title: title || 'Live Broadcast',
          description: body || 'Join my live stream!',
        })
        return res.data
      }

      if (selectedType === 'STORY') {
        // Create 24h story
        const res = await api.post('/stories', {
          mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
          mediaType: 'PHOTO',
          caption: body || title || '',
        })
        return res.data
      }

      // Create regular post
      const payload = {
        type: selectedType === 'SHORTS' ? 'VIDEO' : selectedType,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        mediaUrls: mediaUrl ? [mediaUrl.trim()] : [],
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        accessLevel,
        pollQuestion: title.trim() || undefined,
        pollOptions: selectedType === 'POLL' ? pollOptions.filter((o) => o.trim().length > 0) : undefined,
      }

      const res = await api.post('/posts', payload)
      return res.data
    },
    onSuccess: (data) => {
      if (data?.error) {
        Alert.alert('Publish Failed', data.error)
        return
      }

      Alert.alert('Published! 🎉', 'Your content has been published successfully.', [
        {
          text: 'View Feed',
          onPress: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['creatorStats'] })
            handleClose()
            router.push('/(fan)/feed' as any)
          },
        },
      ])
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not publish content. Please try again.')
    },
  })

  const handleSelectType = (type: PostTypeOption) => {
    if (type === 'LIVE') {
      onClose()
      setTimeout(() => {
        router.push('/(fan)/feed' as any)
      }, 100)
      return
    }
    setSelectedType(type)
  }

  const handleAddPollOption = () => {
    if (pollOptions.length >= 5) {
      Alert.alert('Limit reached', 'Maximum 5 options per poll.')
      return
    }
    setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])
  }

  const handleUpdatePollOption = (text: string, index: number) => {
    const updated = [...pollOptions]
    updated[index] = text
    setPollOptions(updated)
  }

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) {
      Alert.alert('Minimum options', 'A poll requires at least 2 options.')
      return
    }
    setPollOptions(pollOptions.filter((_, i) => i !== index))
  }

  const isFormValid = () => {
    if (!selectedType) return false
    if (selectedType === 'POLL') {
      return title.trim().length > 0 && pollOptions.filter((o) => o.trim().length > 0).length >= 2
    }
    if (selectedType === 'TEXT') {
      return body.trim().length > 0 || title.trim().length > 0
    }
    return title.trim().length > 0 || body.trim().length > 0 || mediaUrl.trim().length > 0
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            {selectedType ? (
              <TouchableOpacity onPress={() => setSelectedType(null)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerLeft}>
                <Sparkles size={18} color={Colors.primary} />
                <Text style={styles.headerTitle}>Create Content</Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── 1. Post Types Dropdown / Grid ── */}
            {!selectedType ? (
              <View style={styles.typeGrid}>
                <Text style={styles.gridHeading}>CHOOSE CONTENT TYPE</Text>

                {POST_TYPES.map((item) => {
                  const Icon = item.icon
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={styles.typeCard}
                      onPress={() => handleSelectType(item.type)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.typeIconBox, { backgroundColor: item.bg }]}>
                        <Icon size={22} color={item.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.typeLabel}>{item.label}</Text>
                        <Text style={styles.typeDesc}>{item.desc}</Text>
                      </View>
                      <ChevronRight size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )
                })}
              </View>
            ) : (
              /* ── 2. Content Composer Form ── */
              <View style={styles.formContainer}>
                <View style={styles.selectedTypeHeader}>
                  <Text style={styles.selectedTypeTitle}>
                    Publishing {selectedType}
                  </Text>
                </View>

                {/* Title / Question */}
                <Text style={styles.inputLabel}>
                  {selectedType === 'POLL' ? 'Poll Question *' : 'Post Title'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    selectedType === 'POLL'
                      ? 'Ask your audience something…'
                      : 'Give your post a title (optional)'
                  }
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Caption / Description */}
                {selectedType !== 'POLL' && (
                  <>
                    <Text style={styles.inputLabel}>Caption & Thoughts</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="What would you like to share with your subscribers?"
                      placeholderTextColor="#94A3B8"
                      value={body}
                      onChangeText={setBody}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </>
                )}

                {/* Media URL Input (for Photo, Video, Shorts, Audio, Story) */}
                {['PHOTO', 'VIDEO', 'SHORTS', 'AUDIO', 'STORY'].includes(selectedType) && (
                  <>
                    <Text style={styles.inputLabel}>Media URL (Cloudinary / Direct Link)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="https://... (image, video, or audio url)"
                      placeholderTextColor="#94A3B8"
                      value={mediaUrl}
                      onChangeText={setMediaUrl}
                      autoCapitalize="none"
                    />
                  </>
                )}

                {/* Thumbnail URL Input (for Video) */}
                {['VIDEO', 'SHORTS'].includes(selectedType) && (
                  <>
                    <Text style={styles.inputLabel}>Cover Thumbnail URL (optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="https://... cover thumbnail image"
                      placeholderTextColor="#94A3B8"
                      value={thumbnailUrl}
                      onChangeText={setThumbnailUrl}
                      autoCapitalize="none"
                    />
                  </>
                )}

                {/* Poll Options */}
                {selectedType === 'POLL' && (
                  <View style={styles.pollSection}>
                    <Text style={styles.inputLabel}>Poll Options</Text>
                    {pollOptions.map((opt, i) => (
                      <View key={i} style={styles.pollOptionRow}>
                        <TextInput
                          style={[styles.input, { flex: 1, marginBottom: 0 }]}
                          placeholder={`Option ${i + 1}`}
                          placeholderTextColor="#94A3B8"
                          value={opt}
                          onChangeText={(t) => handleUpdatePollOption(t, i)}
                        />
                        {pollOptions.length > 2 && (
                          <TouchableOpacity
                            style={styles.deleteOptionBtn}
                            onPress={() => handleRemovePollOption(i)}
                          >
                            <Trash2 size={16} color="#DC2626" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {pollOptions.length < 5 && (
                      <TouchableOpacity
                        style={styles.addOptionBtn}
                        onPress={handleAddPollOption}
                        activeOpacity={0.8}
                      >
                        <Plus size={15} color={Colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.addOptionBtnText}>Add Another Option</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Access Level Selector */}
                {selectedType !== 'STORY' && selectedType !== 'LIVE' && (
                  <View style={styles.accessSection}>
                    <Text style={styles.inputLabel}>Who Can View This Post?</Text>
                    <View style={styles.accessRow}>
                      <TouchableOpacity
                        style={[
                          styles.accessPill,
                          accessLevel === 'PUBLIC' && styles.accessPillActive,
                        ]}
                        onPress={() => setAccessLevel('PUBLIC')}
                      >
                        <Globe size={14} color={accessLevel === 'PUBLIC' ? '#FFFFFF' : '#64748B'} />
                        <Text
                          style={[
                            styles.accessPillText,
                            accessLevel === 'PUBLIC' && styles.accessPillTextActive,
                          ]}
                        >
                          Public
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.accessPill,
                          accessLevel === 'FOLLOWERS_ONLY' && styles.accessPillActive,
                        ]}
                        onPress={() => setAccessLevel('FOLLOWERS_ONLY')}
                      >
                        <Users size={14} color={accessLevel === 'FOLLOWERS_ONLY' ? '#FFFFFF' : '#64748B'} />
                        <Text
                          style={[
                            styles.accessPillText,
                            accessLevel === 'FOLLOWERS_ONLY' && styles.accessPillTextActive,
                          ]}
                        >
                          Followers
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.accessPill,
                          accessLevel === 'SUBSCRIBERS_ONLY' && styles.accessPillActive,
                        ]}
                        onPress={() => setAccessLevel('SUBSCRIBERS_ONLY')}
                      >
                        <Lock size={14} color={accessLevel === 'SUBSCRIBERS_ONLY' ? '#FFFFFF' : '#64748B'} />
                        <Text
                          style={[
                            styles.accessPillText,
                            accessLevel === 'SUBSCRIBERS_ONLY' && styles.accessPillTextActive,
                          ]}
                        >
                          Subscribers Only
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Publish CTA */}
                <TouchableOpacity
                  style={[
                    styles.publishBtn,
                    (!isFormValid() || createMutation.isPending) && styles.publishBtnDisabled,
                  ]}
                  onPress={() => createMutation.mutate()}
                  disabled={!isFormValid() || createMutation.isPending}
                  activeOpacity={0.85}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.publishBtnText}>Publish Now</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    paddingBottom: 36,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  gridHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 2,
  },
  typeGrid: {
    gap: 10,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    ...Shadows.sm,
  },
  typeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  typeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  /* Form */
  formContainer: {
    gap: 14,
  },
  selectedTypeHeader: {
    marginBottom: 4,
  },
  selectedTypeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pollSection: {
    gap: 8,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deleteOptionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  addOptionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  accessSection: {
    marginTop: 4,
    gap: 8,
  },
  accessRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accessPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 5,
  },
  accessPillActive: {
    backgroundColor: Colors.primary,
  },
  accessPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  accessPillTextActive: {
    color: '#FFFFFF',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
    ...Shadows.sm,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

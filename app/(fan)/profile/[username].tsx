import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Loader } from '@/components/Loader'

export default function CreatorProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['creator', username],
    queryFn: () => api.get(`/creators/${username}`).then((r) => r.data),
  })

  const followMutation = useMutation({
    mutationFn: () => api.post(`/creators/${data?.creator?.id}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creator', username] }),
  })

  const callMutation = useMutation({
    mutationFn: (type: 'VOICE' | 'VIDEO') =>
      api.post('/calls/initiate', { conversationId: 'TODO', type }),
  })

  if (isLoading) {
    return <Loader message="Loading profile…" />
  }

  if (!data?.creator) {
    return <View style={s.loading}><Text style={s.notFound}>Creator not found</Text></View>
  }

  const { creator, viewer } = data

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={s.banner}>
        {creator.bannerImage ? (
          <Image source={{ uri: creator.bannerImage }} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, s.bannerGradient]} />
        )}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={s.avatarWrapper}>
        <Image source={{ uri: creator.image ?? 'https://via.placeholder.com/90' }} style={s.avatar} />
      </View>

      <View style={s.info}>
        <Text style={s.displayName}>
          {creator.displayName} {creator.isVerified ? '✓' : ''}
        </Text>
        {creator.username && <Text style={s.handle}>@{creator.username}</Text>}
        {creator.bio && <Text style={s.bio}>{creator.bio}</Text>}

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statNum}>{(creator.followersCount ?? 0).toLocaleString()}</Text>
            <Text style={s.statLabel}>Followers</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statNum}>{(creator.subscribersCount ?? 0).toLocaleString()}</Text>
            <Text style={s.statLabel}>Subscribers</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statNum}>{(creator.postsCount ?? 0).toLocaleString()}</Text>
            <Text style={s.statLabel}>Posts</Text>
          </View>
        </View>

        {/* Actions */}
        {!viewer.isOwnProfile && (
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.followBtn, viewer.isFollowing && s.followingBtn]}
              onPress={() => followMutation.mutate()}
            >
              <Text style={s.followBtnText}>{viewer.isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>

            {creator.voiceCallsEnabled && creator.availableForCalls && (
              <TouchableOpacity style={s.callBtn} onPress={() => callMutation.mutate('VOICE')}>
                <Text style={s.callBtnText}>📞 Voice Call</Text>
                {creator.voiceCallRate && <Text style={s.rateText}>₦{creator.voiceCallRate?.toLocaleString()}/hr</Text>}
              </TouchableOpacity>
            )}
            {creator.videoCallsEnabled && creator.availableForCalls && (
              <TouchableOpacity style={s.callBtn} onPress={() => callMutation.mutate('VIDEO')}>
                <Text style={s.callBtnText}>📹 Video Call</Text>
                {creator.videoCallRate && <Text style={s.rateText}>₦{creator.videoCallRate?.toLocaleString()}/hr</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Subscription plans */}
        {creator.plans?.length > 0 && (
          <View style={s.plans}>
            <Text style={s.sectionTitle}>Subscribe</Text>
            {creator.plans.map((plan: any) => (
              <TouchableOpacity key={plan.id} style={s.planCard}>
                <View>
                  <Text style={s.planName}>{plan.name}</Text>
                  <Text style={s.planBenefits}>{plan.benefits?.slice(0, 2).join(' · ')}</Text>
                </View>
                <Text style={s.planPrice}>₦{Number(plan.price).toLocaleString()}/{plan.interval === 'MONTHLY' ? 'mo' : 'yr'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  loading: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  notFound: { color: '#666', fontSize: 16 },
  banner: { height: 200, overflow: 'hidden' },
  bannerGradient: { backgroundColor: '#1a0533' },
  backBtn: { position: 'absolute', top: 56, left: 20, backgroundColor: '#00000080', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20 },
  avatarWrapper: { alignItems: 'center', marginTop: -45 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#0a0a0a', backgroundColor: '#222' },
  info: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  displayName: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  handle: { color: '#888', textAlign: 'center', marginTop: 4, fontSize: 14 },
  bio: { color: '#aaa', textAlign: 'center', marginTop: 12, fontSize: 14, lineHeight: 20 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 20, marginBottom: 20 },
  stat: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 2 },
  actions: { gap: 12, marginBottom: 24 },
  followBtn: { backgroundColor: '#a855f7', borderRadius: 12, padding: 14, alignItems: 'center' },
  followingBtn: { backgroundColor: '#2a1a3e', borderWidth: 1, borderColor: '#a855f7' },
  followBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  callBtn: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  callBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  rateText: { color: '#a855f7', fontSize: 12, marginTop: 4 },
  plans: { marginTop: 8 },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 18, marginBottom: 12 },
  planCard: { backgroundColor: '#111', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1a1a1a' },
  planName: { color: '#fff', fontWeight: '600', fontSize: 15, marginBottom: 4 },
  planBenefits: { color: '#888', fontSize: 12 },
  planPrice: { color: '#a855f7', fontWeight: '700', fontSize: 15 },
})

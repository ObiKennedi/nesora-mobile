// app/(creator)/calls/index.tsx — Creator 1-on-1 Call Management, Availability & Rate Settings
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native'
import {
  Menu,
  Bell,
  Phone,
  Video,
  Clock,
  DollarSign,
  Crown,
  CheckCircle2,
  PhoneMissed,
  PhoneOff,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { SideDrawer } from '@/components/navigation/SideDrawer'
import { Colors, Radius, Shadows } from '@/constants/theme'

const VOICE_RATE_PRESETS = [
  { label: 'Free', val: 0 },
  { label: '₦3,000/hr (₦50/min)', val: 3000 },
  { label: '₦6,000/hr (₦100/min)', val: 6000 },
  { label: '₦12,000/hr (₦200/min)', val: 12000 },
]

const VIDEO_RATE_PRESETS = [
  { label: 'Free', val: 0 },
  { label: '₦6,000/hr (₦100/min)', val: 6000 },
  { label: '₦12,000/hr (₦200/min)', val: 12000 },
  { label: '₦24,000/hr (₦400/min)', val: 24000 },
]

export default function CreatorCallsScreen() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 1. Fetch Call Settings
  const { data: settingsData, isLoading: loadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['creatorCallSettings'],
    queryFn: async () => {
      const res = await api.get('/calls/settings')
      return res.data
    },
  })

  // 2. Fetch Call History
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['creatorCallHistory'],
    queryFn: async () => {
      const res = await api.get('/calls/history')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchSettings(), refetchHistory()])
    setRefreshing(false)
  }, [refetchSettings, refetchHistory])

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/calls/settings', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorCallSettings'] })
      refetchSettings()
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not update call settings.')
    },
  })

  const availableForCalls = settingsData?.availableForCalls ?? true
  const voiceCallsEnabled = settingsData?.voiceCallsEnabled ?? true
  const videoCallsEnabled = settingsData?.videoCallsEnabled ?? true
  const voiceRate = settingsData?.voiceCallRate ?? 0
  const videoRate = settingsData?.videoCallRate ?? 0
  const topFanFreeCount = settingsData?.topFanFreeCallCount ?? 5

  const callHistory = historyData ?? []

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Menu size={22} color="#1A202C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>1-on-1 Calls</Text>

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
        {/* ── 1. Master Availability Card ── */}
        <View style={styles.card}>
          <View style={styles.availRow}>
            <View style={styles.availLeft}>
              <View
                style={[
                  styles.availStatusDot,
                  availableForCalls ? styles.statusDotOnline : styles.statusDotOffline,
                ]}
              />
              <View>
                <Text style={styles.availTitle}>
                  {availableForCalls ? 'Available for Calls (Online)' : 'Unavailable for Calls (Offline)'}
                </Text>
                <Text style={styles.availSub}>
                  {availableForCalls
                    ? 'Fans can initiate 1-on-1 voice & video calls. You will be notified instantly.'
                    : 'Calls are paused. Fans will see you as currently unavailable.'}
                </Text>
              </View>
            </View>

            <Switch
              value={availableForCalls}
              onValueChange={(val) => updateMutation.mutate({ availableForCalls: val })}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── 2. Voice Calls Settings Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EBF4FF' }]}>
                <Phone size={18} color="#2563EB" />
              </View>
              <Text style={styles.cardTitle}>Audio / Voice Calls</Text>
            </View>
            <Switch
              value={voiceCallsEnabled}
              onValueChange={(val) => updateMutation.mutate({ voiceCallsEnabled: val })}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {voiceCallsEnabled && (
            <View style={styles.rateOptionsWrap}>
              <Text style={styles.rateSectionLabel}>Select Voice Call Rate</Text>
              <View style={styles.presetGrid}>
                {VOICE_RATE_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.val}
                    style={[
                      styles.presetPill,
                      voiceRate === p.val && styles.presetPillActive,
                    ]}
                    onPress={() => updateMutation.mutate({ voiceCallRate: p.val })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetPillText,
                        voiceRate === p.val && styles.presetPillTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── 3. Video Calls Settings Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                <Video size={18} color="#EA580C" />
              </View>
              <Text style={styles.cardTitle}>Video Calls</Text>
            </View>
            <Switch
              value={videoCallsEnabled}
              onValueChange={(val) => updateMutation.mutate({ videoCallsEnabled: val })}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {videoCallsEnabled && (
            <View style={styles.rateOptionsWrap}>
              <Text style={styles.rateSectionLabel}>Select Video Call Rate</Text>
              <View style={styles.presetGrid}>
                {VIDEO_RATE_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.val}
                    style={[
                      styles.presetPill,
                      videoRate === p.val && styles.presetPillActive,
                    ]}
                    onPress={() => updateMutation.mutate({ videoCallRate: p.val })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetPillText,
                        videoRate === p.val && styles.presetPillTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── 4. Top Fan Free Quota Card ── */}
        <View style={styles.card}>
          <View style={styles.topFanHeader}>
            <Crown size={18} color="#D97706" />
            <Text style={styles.cardTitle}>Top Supporter Free Calling</Text>
          </View>
          <Text style={styles.cardSub}>
            Reward your most loyal supporters by letting them call you free of charge.
          </Text>

          <View style={styles.presetGrid}>
            {[
              { label: 'None (Paid for all)', val: 0 },
              { label: 'Top 3 Supporters', val: 3 },
              { label: 'Top 5 Supporters', val: 5 },
              { label: 'Top 10 Supporters', val: 10 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.val}
                style={[
                  styles.presetPill,
                  topFanFreeCount === opt.val && styles.presetPillActive,
                ]}
                onPress={() => updateMutation.mutate({ topFanFreeCallCount: opt.val })}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    topFanFreeCount === opt.val && styles.presetPillTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 5. Call History & Logs ── */}
        <View style={styles.card}>
          <View style={styles.topFanHeader}>
            <Clock size={18} color="#64748B" />
            <Text style={styles.cardTitle}>Recent Call Logs</Text>
          </View>

          {callHistory.length === 0 ? (
            <View style={styles.emptyLogsWrap}>
              <Text style={styles.emptyLogsText}>No recent call logs.</Text>
            </View>
          ) : (
            <View style={styles.logsList}>
              {callHistory.map((call: any) => {
                const isVideo = call.type === 'VIDEO'
                const isCompleted = call.status === 'ENDED' || call.status === 'IN_PROGRESS'
                const isMissed = call.status === 'MISSED'
                const timeStr = call.createdAt
                  ? formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })
                  : ''

                return (
                  <View key={call.id} style={styles.logItem}>
                    <View style={styles.logLeft}>
                      <View
                        style={[
                          styles.logIconWrap,
                          isVideo ? styles.logIconVideo : styles.logIconAudio,
                        ]}
                      >
                        {isVideo ? (
                          <Video size={16} color="#EA580C" />
                        ) : (
                          <Phone size={16} color="#2563EB" />
                        )}
                      </View>

                      <View>
                        <Text style={styles.logCallerName}>
                          {call.fan?.name || 'Fan Member'}
                        </Text>
                        <Text style={styles.logMeta}>
                          {timeStr} {call.billedMinutes ? `· ${call.billedMinutes}m` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      {call.billedAmount > 0 && (
                        <Text style={styles.logEarnings}>
                          +₦{Number(call.billedAmount).toLocaleString()}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.logStatusBadge,
                          isCompleted
                            ? styles.badgeGreen
                            : isMissed
                            ? styles.badgeAmber
                            : styles.badgeRed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.logStatusText,
                            isCompleted
                              ? styles.textGreen
                              : isMissed
                              ? styles.textAmber
                              : styles.textRed,
                          ]}
                        >
                          {call.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Side Navigation Drawer ── */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    gap: 14,
    paddingBottom: 40,
  },
  /* Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  availLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  availStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  statusDotOnline: { backgroundColor: '#10B981' },
  statusDotOffline: { backgroundColor: '#EF4444' },
  availTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  availSub: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  rateOptionsWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rateSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  presetGrid: {
    gap: 8,
  },
  presetPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: Colors.primary,
  },
  presetPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  presetPillTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  topFanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  /* Logs */
  emptyLogsWrap: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyLogsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  logsList: {
    gap: 10,
    marginTop: 10,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIconVideo: { backgroundColor: '#FFF7ED' },
  logIconAudio: { backgroundColor: '#EBF4FF' },
  logCallerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  logMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  logEarnings: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  logStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeAmber: { backgroundColor: '#FEF3C7' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  logStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  textGreen: { color: '#059669' },
  textAmber: { color: '#D97706' },
  textRed: { color: '#EF4444' },
})

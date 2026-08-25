// app/(fan)/notifications/index.tsx — Notifications screen respecting Creator & Fan routing
import React from 'react'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  DollarSign,
  Heart,
  MessageCircle,
  Radio,
  Sparkles,
  Users,
  ShieldAlert,
} from 'lucide-react-native'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius, Shadows } from '@/constants/theme'

export default function NotificationsScreen() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isCreator = user?.onboardingType === 'CREATOR'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  })

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      refetch()
    },
  })

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else if (isCreator) {
      router.replace('/(creator)/dashboard' as any)
    } else {
      router.replace('/(fan)/feed' as any)
    }
  }

  const handleNotificationPress = (item: any) => {
    const type = item.type || ''
    if (type.includes('MESSAGE')) {
      router.push(isCreator ? ('/(creator)/messages' as any) : ('/(fan)/messages' as any))
    } else if (type.includes('PAYOUT') || type.includes('WALLET') || type.includes('TIP') || type.includes('GIFT')) {
      router.push(isCreator ? ('/(creator)/wallet' as any) : ('/(fan)/profile/wallet' as any))
    } else if (type.includes('FOLLOWER') || type.includes('SUBSCRIBER')) {
      router.push(isCreator ? ('/(creator)/audience' as any) : ('/(fan)/feed' as any))
    } else if (type.includes('LIVE')) {
      router.push(isCreator ? ('/(creator)/dashboard' as any) : ('/(fan)/feed' as any))
    } else {
      handleBack()
    }
  }

  const notifs = data?.notifications ?? []

  const getIconForType = (type?: string) => {
    if (!type) return <Bell size={18} color={Colors.primary} />
    if (type.includes('MESSAGE')) return <MessageCircle size={18} color="#3B82F6" />
    if (type.includes('SUBSCRIBER') || type.includes('FOLLOWER'))
      return <Users size={18} color="#10B981" />
    if (type.includes('PAYOUT') || type.includes('TIP') || type.includes('GIFT'))
      return <DollarSign size={18} color="#EA580C" />
    if (type.includes('LIVE')) return <Radio size={18} color="#EF4444" />
    return <Sparkles size={18} color={Colors.primary} />
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#1A202C" />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>

        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={() => markAll.mutate()}
          activeOpacity={0.7}
        >
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(i: any) => i.id}
          contentContainerStyle={notifs.length === 0 ? styles.emptyContainer : styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={[styles.row, !item.isRead && styles.unreadRow]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, !item.isRead && styles.unreadIconBox]}>
                {getIconForType(item.type)}
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitle]}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.dot} />}
                </View>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.time}>
                  {item.createdAt
                    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconBox}>
                <Bell size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>
                Updates about messages, subscribers, and platform activities will appear here.
              </Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Shadows.sm,
  },
  unreadRow: {
    backgroundColor: '#FFFDFB',
    borderColor: '#FED7AA',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIconBox: {
    backgroundColor: '#FFF7ED',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 14,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notifBody: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    color: '#94A3B8',
    fontSize: 11.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },
})

// app/(fan)/notifications/index.tsx
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsScreen() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  })
  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifs = data?.notifications ?? []

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Notifications</Text>
        <TouchableOpacity onPress={() => markAll.mutate()}>
          <Text style={s.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={s.loading}><ActivityIndicator color="#a855f7" size="large" /></View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(i: any) => i.id}
          renderItem={({ item }: any) => (
            <View style={[s.row, !item.isRead && s.unread]}>
              <View style={s.dotContainer}>
                {!item.isRead && <View style={s.dot} />}
              </View>
              <View style={s.content}>
                <Text style={s.notifTitle}>{item.title}</Text>
                <Text style={s.notifBody}>{item.body}</Text>
                <Text style={s.time}>
                  {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : ''}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔔</Text>
              <Text style={s.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  markAll: { color: '#a855f7', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#111', gap: 12 },
  unread: { backgroundColor: '#0d0d15' },
  dotContainer: { width: 10, paddingTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#a855f7' },
  content: { flex: 1 },
  notifTitle: { color: '#fff', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  notifBody: { color: '#888', fontSize: 13, lineHeight: 18, marginBottom: 6 },
  time: { color: '#555', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: '#555', fontSize: 16 },
})

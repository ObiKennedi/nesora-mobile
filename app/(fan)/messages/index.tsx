// app/(fan)/messages/index.tsx — Conversation list
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '@/lib/api'

export default function MessagesScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages').then((r) => r.data),
  })

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Messages</Text>
      </View>
      {isLoading ? (
        <View style={s.loading}><ActivityIndicator color="#a855f7" size="large" /></View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={s.row}
              onPress={() => router.push({ pathname: '/(fan)/messages/[conversationId]', params: { conversationId: item.id } })}
            >
              <Image source={{ uri: item.creator?.user?.image ?? 'https://via.placeholder.com/48' }} style={s.avatar} />
              <View style={s.info}>
                <Text style={s.name}>{item.creator?.displayName}</Text>
                <Text style={s.preview} numberOfLines={1}>{item.lastMessageText ?? 'No messages yet'}</Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{item.unreadCount}</Text></View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>No conversations yet</Text></View>}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#111', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#222' },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15, marginBottom: 4 },
  preview: { color: '#666', fontSize: 13 },
  badge: { backgroundColor: '#a855f7', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#555', fontSize: 16 },
})

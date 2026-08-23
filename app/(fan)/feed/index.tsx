// app/(fan)/feed/index.tsx — Main fan feed

import { useState, useCallback } from 'react'
import {
  View, FlatList, RefreshControl, StyleSheet, Text, ActivityIndicator,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import PostCard from '@/components/feed/PostCard'

import { Loader } from '@/components/Loader'

async function fetchFeed(page = 1, category = 'ALL') {
  const { data } = await api.get('/feed', { params: { page, category } })
  return data
}

export default function FeedScreen() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => fetchFeed(),
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['feed'] })
    setRefreshing(false)
  }, [queryClient])

  if (isLoading) {
    return <Loader message="Loading your feed…" />
  }

  const posts = data?.posts ?? []

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>NESORA</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
        contentContainerStyle={posts.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🎭</Text>
            <Text style={s.emptyTitle}>Your feed is empty</Text>
            <Text style={s.emptySub}>Follow some creators to see their posts here.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  loading: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  logo: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 3 },
  list: { paddingBottom: 100 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySub: { color: '#666', textAlign: 'center', fontSize: 15, paddingHorizontal: 40 },
})

// app/(fan)/discover/index.tsx
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '@/lib/api'

export default function DiscoverScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: () => api.get('/discover').then((r) => r.data),
  })

  return (
    <View style={s.root}>
      <View style={s.header}><Text style={s.title}>Discover</Text></View>
      {isLoading ? (
        <View style={s.loading}><ActivityIndicator color="#a855f7" size="large" /></View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(i: any) => i.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.list}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push({ pathname: '/(fan)/profile/[username]', params: { username: item.handle ?? item.id } })}
            >
              <Image source={{ uri: item.user?.image ?? 'https://via.placeholder.com/80' }} style={s.avatar} />
              <Text style={s.name} numberOfLines={1}>{item.displayName}</Text>
              <Text style={s.followers}>{(item.followersCount ?? 0).toLocaleString()} followers</Text>
              {item.creatorCategories?.length > 0 && (
                <Text style={s.cat}>{item.creatorCategories[0].category}</Text>
              )}
            </TouchableOpacity>
          )}
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
  list: { padding: 12, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#222', marginBottom: 12 },
  name: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  followers: { color: '#888', fontSize: 12, marginBottom: 6 },
  cat: { color: '#a855f7', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
})

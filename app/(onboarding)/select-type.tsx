// app/(onboarding)/select-type.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'

export default function SelectTypeScreen() {
  const { setUser, user } = useAuthStore()
  const [loading, setLoading] = useState<'FAN' | 'CREATOR' | null>(null)

  const select = async (type: 'FAN' | 'CREATOR') => {
    setLoading(type)
    try {
      await api.post('/onboarding/select-type', { type })
      setUser({ ...user!, onboardingType: type })
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <View style={s.root}>
      <Text style={s.title}>Welcome to{'\n'}NESORA</Text>
      <Text style={s.sub}>How do you want to use Nesora?</Text>

      <TouchableOpacity style={[s.card, loading === 'FAN' && s.cardActive]} onPress={() => select('FAN')} disabled={!!loading}>
        <Text style={s.cardEmoji}>🎭</Text>
        <Text style={s.cardTitle}>I'm a Fan</Text>
        <Text style={s.cardDesc}>Discover creators, subscribe, send messages and book calls.</Text>
        {loading === 'FAN' && <ActivityIndicator color="#a855f7" style={{ marginTop: 12 }} />}
      </TouchableOpacity>

      <TouchableOpacity style={[s.card, loading === 'CREATOR' && s.cardActive]} onPress={() => select('CREATOR')} disabled={!!loading}>
        <Text style={s.cardEmoji}>✨</Text>
        <Text style={s.cardTitle}>I'm a Creator</Text>
        <Text style={s.cardDesc}>Share content, grow your audience, and monetise your talent.</Text>
        {loading === 'CREATOR' && <ActivityIndicator color="#a855f7" style={{ marginTop: 12 }} />}
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12, lineHeight: 44 },
  sub: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 40 },
  card: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center',
  },
  cardActive: { borderColor: '#a855f7' },
  cardEmoji: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  cardDesc: { color: '#888', textAlign: 'center', fontSize: 14, lineHeight: 20 },
})

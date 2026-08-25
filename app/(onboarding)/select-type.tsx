// app/(onboarding)/select-type.tsx — Account type selection for new sign-ups
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { Sparkles, Compass, Shield, ArrowRight } from 'lucide-react-native'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius, Shadows } from '@/constants/theme'

export default function SelectTypeScreen() {
  const { setUser, user } = useAuthStore()
  const [loading, setLoading] = useState<'FAN' | 'CREATOR' | null>(null)

  const select = async (type: 'FAN' | 'CREATOR') => {
    setLoading(type)
    try {
      await api.post('/onboarding/select-type', { type })
      setUser({ ...user!, onboardingType: type })

      if (type === 'FAN') {
        // Show billing & membership showcase for new fan sign ups
        router.replace('/(onboarding)/billing' as any)
      } else {
        router.replace('/(creator)/dashboard' as any)
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandN}>N</Text>
          <Text style={styles.brandText}>esora</Text>
        </View>
        <Text style={styles.title}>Welcome to NESORA</Text>
        <Text style={styles.sub}>How do you want to experience the platform?</Text>
      </View>

      {/* Fan Option */}
      <TouchableOpacity
        style={[styles.card, loading === 'FAN' && styles.cardActive]}
        onPress={() => select('FAN')}
        disabled={!!loading}
        activeOpacity={0.88}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.cardEmoji}>🎭</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>I'm a Fan</Text>
          <Text style={styles.cardDesc}>
            Discover top creators, enjoy exclusive content, send messages and join live streams.
          </Text>
        </View>
        {loading === 'FAN' ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <ArrowRight size={18} color="#94A3B8" />
        )}
      </TouchableOpacity>

      {/* Creator Option */}
      <TouchableOpacity
        style={[styles.card, loading === 'CREATOR' && styles.cardActive]}
        onPress={() => select('CREATOR')}
        disabled={!!loading}
        activeOpacity={0.88}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.cardEmoji}>✨</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>I'm a Creator</Text>
          <Text style={styles.cardDesc}>
            Share photos, videos & audio, grow your audience, and monetize your content.
          </Text>
        </View>
        {loading === 'CREATOR' ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <ArrowRight size={18} color="#94A3B8" />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  brandN: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#8A3B14',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  sub: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 14,
    ...Shadows.sm,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF7ED',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#64748B',
    fontSize: 12.5,
    lineHeight: 17,
  },
})

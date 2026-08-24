// app/(fan)/feed/shorts.tsx — Shorts / video reel feed
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

export default function ShortsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎬</Text>
      <Text style={styles.title}>Shorts Feed</Text>
      <Text style={styles.subtitle}>Shorts and video clips from your favorite creators will appear here.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
})

// app/+not-found.tsx — Global 404 handler that gracefully routes users back
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Loader } from '@/components/Loader'

export default function NotFoundScreen() {
  useEffect(() => {
    // Automatically redirect back to the home feed or entry
    const timer = setTimeout(() => {
      router.replace('/(fan)/feed' as any)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Loader message="Redirecting to feed…" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
})

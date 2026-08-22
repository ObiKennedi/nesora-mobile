// components/auth/ContinueWithGoogle.tsx

import React, { useState } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { Colors, Radius } from '@/constants/theme'
import { useAuthStore } from '@/lib/auth'
import { router } from 'expo-router'

// Complete web browser auth session on redirect
WebBrowser.maybeCompleteAuthSession()

interface ContinueWithGoogleProps {
  onPress?: () => void
  disabled?: boolean
}

export const ContinueWithGoogle: React.FC<ContinueWithGoogleProps> = ({
  onPress,
  disabled,
}) => {
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()

  const handleGoogleAuth = async () => {
    if (onPress) {
      onPress()
      return
    }

    setLoading(true)
    try {
      // Backend OAuth URL or Google OAuth redirect
      const apiBase = process.env.EXPO_PUBLIC_API_URL || 'https://nesora-api.onrender.com'
      const authUrl = `${apiBase}/auth/google`

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'nesora://(auth)/callback'
      )

      if (result.type === 'success' && result.url) {
        // Parse token/user parameters from redirect URL if returned
        Alert.alert('Google Sign In', 'Google authentication successful!')
        router.replace('/(fan)/feed' as any)
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User cancelled authentication session
        console.log('User cancelled Google sign in')
      }
    } catch (error) {
      console.error('Google Sign In Error:', error)
      Alert.alert('Google Sign In', 'Could not complete Google authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled]}
      onPress={handleGoogleAuth}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.text}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
})

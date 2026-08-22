// components/auth/ContinueWithGoogle.tsx — Google Authentication using Web Client ID

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
import { makeRedirectUri } from 'expo-auth-session'
import { Colors, Radius } from '@/constants/theme'
import { useAuthStore } from '@/lib/auth'
import { router } from 'expo-router'
import { api } from '@/lib/api'

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

  const googleClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    '443484828850-7mb86lr6gdsr5770lceig7qcqrb7q3k4.apps.googleusercontent.com'

  const handleGoogleAuth = async () => {
    if (onPress) {
      onPress()
      return
    }

    setLoading(true)
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'nesora',
        path: 'auth/callback',
      })

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(googleClientId)}` +
        `&response_type=token` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent('email profile')}`

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

      if (result.type === 'success' && result.url) {
        // Extract access_token from URL fragment
        const match = result.url.match(/access_token=([^&]+)/)
        const token = match ? match[1] : null

        if (token) {
          // Fetch user info from Google API
          const userInfoRes = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const googleUser = await userInfoRes.json()

          if (googleUser.email) {
            // Register or Login via Backend API
            try {
              const res = await api.post('/auth/login', {
                email: googleUser.email,
                isGoogle: true,
              })
              if (res.data?.user) {
                setUser(res.data.user)
              }
            } catch {
              // Fallback user object
              setUser({
                id: googleUser.id || 'google-user',
                email: googleUser.email,
                name: googleUser.name || 'Google User',
                username: googleUser.email.split('@')[0],
                image: googleUser.picture || null,
                role: 'USER',
                onboardingType: 'FAN',
              })
            }

            router.replace('/(fan)/feed' as any)
            return
          }
        }
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

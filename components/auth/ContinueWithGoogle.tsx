// components/auth/ContinueWithGoogle.tsx — Official Expo Google Auth Provider
import React, { useEffect, useState } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { Colors, Radius } from '@/constants/theme'
import { useAuthStore } from '@/lib/auth'
import { router } from 'expo-router'

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
  const { googleLogin } = useAuthStore()

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      '443484828850-7mb86lr6gdsr5770lceig7qcqrb7q3k4.apps.googleusercontent.com',
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      '443484828850-ec9nhf0gvsp9l0f5g7njhije1qggc0a5.apps.googleusercontent.com',
    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      '443484828850-7mb86lr6gdsr5770lceig7qcqrb7q3k4.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
  })


  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response
      handleAuthSuccess(authentication)
    } else if (response?.type === 'error') {
      setLoading(false)
      Alert.alert('Google Sign In', response.error?.message || 'Authentication failed.')
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false)
    }
  }, [response])

  const handleAuthSuccess = async (authentication: any) => {
    try {
      setLoading(true)
      const accessToken = authentication?.accessToken
      const idToken = authentication?.idToken

      let userInfo: any = null

      if (accessToken) {
        try {
          const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          if (userInfoRes.ok) {
            userInfo = await userInfoRes.json()
          }
        } catch (e) {
          console.warn('UserInfo fetch warning:', e)
        }
      }

      if (!userInfo?.email && idToken) {
        const tokenParts = idToken.split('.')
        if (tokenParts.length >= 2) {
          try {
            const base64Url = tokenParts[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const decoded =
              typeof atob === 'function'
                ? atob(base64)
                : Buffer.from(base64, 'base64').toString('utf-8')
            userInfo = JSON.parse(decoded)
          } catch (e) {
            console.error('Failed to decode idToken payload:', e)
          }
        }
      }

      if (userInfo?.email) {
        const loggedInUser = await googleLogin({
          email: userInfo.email,
          name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Google User',
          image: userInfo.picture || null,
          googleId: userInfo.sub,
          idToken: idToken || undefined,
        })

        if (!loggedInUser?.onboardingType) {
          router.replace('/(onboarding)/select-type' as any)
        } else {
          router.replace('/(fan)/feed' as any)
        }
      } else {
        throw new Error('Could not retrieve user email from Google.')
      }
    } catch (err: any) {
      console.error('Google Sign In Backend Error:', err)
      Alert.alert('Google Sign In', err?.message || 'Failed to complete sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    if (onPress) {
      onPress()
      return
    }

    try {
      setLoading(true)
      const res = await promptAsync()
      if (res.type !== 'success') {
        setLoading(false)
      }
    } catch (error: any) {
      setLoading(false)
      console.error('Google Sign In Prompt Error:', error)
      Alert.alert('Google Sign In', error?.message || 'Could not start Google authentication.')
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading || !request) && styles.disabled]}
      onPress={handleGoogleAuth}
      disabled={disabled || loading || !request}
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

// components/auth/ContinueWithGoogle.tsx — Google Authentication using OAuth 2.0 PKCE Flow

import React, { useState } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import * as Crypto from 'expo-crypto'
import { Colors, Radius } from '@/constants/theme'
import { useAuthStore } from '@/lib/auth'
import { router } from 'expo-router'

WebBrowser.maybeCompleteAuthSession()

interface ContinueWithGoogleProps {
  onPress?: () => void
  disabled?: boolean
}

function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generatePKCE() {
  const randomBytes = await Crypto.getRandomBytesAsync(32)
  let binary = ''
  for (let i = 0; i < randomBytes.length; i++) {
    binary += String.fromCharCode(randomBytes[i])
  }
  // Convert binary string to base64
  const codeVerifier = toUrlSafeBase64(
    typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  )
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  )
  const codeChallenge = toUrlSafeBase64(hashed)
  return { codeVerifier, codeChallenge }
}

export const ContinueWithGoogle: React.FC<ContinueWithGoogleProps> = ({
  onPress,
  disabled,
}) => {
  const [loading, setLoading] = useState(false)
  const { googleLogin } = useAuthStore()

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    '443484828850-7mb86lr6gdsr5770lceig7qcqrb7q3k4.apps.googleusercontent.com'
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID

  const clientId =
    Platform.select({
      ios: iosClientId || webClientId,
      android: androidClientId || webClientId,
      default: webClientId,
    }) || webClientId

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

      const { codeVerifier, codeChallenge } = await generatePKCE()
      const stateRandom = await Crypto.getRandomBytesAsync(16)
      let stateBinary = ''
      for (let i = 0; i < stateRandom.length; i++) {
        stateBinary += String.fromCharCode(stateRandom[i])
      }
      const state = toUrlSafeBase64(
        typeof btoa === 'function' ? btoa(stateBinary) : Buffer.from(stateBinary, 'binary').toString('base64')
      )

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256` +
        `&state=${encodeURIComponent(state)}`

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

      if (result.type === 'success' && result.url) {
        // Extract query parameters from redirect URL
        const urlObj = new URL(result.url)
        const code = urlObj.searchParams.get('code')
        const error = urlObj.searchParams.get('error')

        if (error) {
          throw new Error(`Google authorization error: ${error}`)
        }

        if (code) {
          // Exchange authorization code for token
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
              code_verifier: codeVerifier,
            }).toString(),
          })

          const tokenData = await tokenRes.json()

          if (!tokenRes.ok || tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code.')
          }

          // Fetch user info from Google
          const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          })
          const googleUser = await userInfoRes.json()

          if (googleUser.email) {
            // Register or Login via Backend API
            const loggedInUser = await googleLogin({
              email: googleUser.email,
              name: googleUser.name || `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim() || 'Google User',
              image: googleUser.picture || null,
              googleId: googleUser.sub,
              idToken: tokenData.id_token,
            })

            if (loggedInUser.onboardingType) {
              router.replace('/(fan)/feed' as any)
            } else {
              router.replace('/(fan)/feed' as any)
            }
            return
          }
        }
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error)
      Alert.alert('Google Sign In', error?.message || 'Could not complete Google authentication.')
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

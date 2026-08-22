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
import { Colors, Radius } from '@/constants/theme'
import { useAuthStore } from '@/lib/auth'

interface ContinueWithGoogleProps {
  onPress?: () => void
  disabled?: boolean
}

export const ContinueWithGoogle: React.FC<ContinueWithGoogleProps> = ({
  onPress,
  disabled,
}) => {
  const [loading, setLoading] = useState(false)

  const handleGoogleAuth = async () => {
    if (onPress) {
      onPress()
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Google Sign-In',
        'Google Authentication requires setting up your Google OAuth Client ID in Google Cloud Console. In the meantime, please sign in or register with your email address above.',
        [{ text: 'OK' }]
      )
    }, 600)
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

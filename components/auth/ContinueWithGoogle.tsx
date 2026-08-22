// components/auth/ContinueWithGoogle.tsx

import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Colors, Radius } from '@/constants/theme'

interface ContinueWithGoogleProps {
  onPress?: () => void
  disabled?: boolean
}

export const ContinueWithGoogle: React.FC<ContinueWithGoogleProps> = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {/* Google G Logo Badge */}
        <Text style={styles.googleG}>G</Text>
      </View>
      <Text style={styles.text}>Continue with Google</Text>
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

// components/auth/CardWrapper.tsx

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { FormHeader } from './FormHeader'
import { ContinueWithGoogle } from './ContinueWithGoogle'
import { Colors, Radius, Shadows } from '@/constants/theme'

interface CardWrapperProps {
  children: React.ReactNode
  heading: string
  subHeading: string
  showSocials?: boolean
  showButton?: boolean
  buttonLabel?: string
  buttonLink: string
  onGooglePress?: () => void
}

export const CardWrapper: React.FC<CardWrapperProps> = ({
  children,
  heading,
  subHeading,
  showSocials = true,
  showButton = true,
  buttonLabel,
  buttonLink,
  onGooglePress,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <FormHeader heading={heading} subHeading={subHeading} />

        <View style={styles.contents}>
          {children}

          {showSocials && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <ContinueWithGoogle onPress={onGooglePress} />
            </>
          )}
        </View>

        {showButton && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.push(buttonLink as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.footerText}>{buttonLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: Colors.bg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  contents: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
})

// app/(auth)/forgot-password.tsx

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { AlertCircle, CheckCircle2 } from 'lucide-react-native'
import { CardWrapper } from '@/components/auth/CardWrapper'
import { Colors, Radius } from '@/constants/theme'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  const handleReset = async () => {
    setFeedback(null)
    if (!email) {
      setFeedback({ type: 'error', message: 'Please enter your email address.' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setFeedback({
        type: 'success',
        message: 'If an account exists with that email, reset instructions have been sent.',
      })
    }, 1200)
  }

  return (
    <CardWrapper
      heading="Reset password"
      subHeading="Enter your email and we'll send you a password reset link."
      showSocials={false}
      showButton
      buttonLabel="Back to Sign in"
      buttonLink="/(auth)/login"
    >
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="ada@example.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        {feedback && (
          <View style={feedback.type === 'error' ? styles.errorBox : styles.successBox}>
            {feedback.type === 'error' ? (
              <AlertCircle size={16} color={Colors.error} style={{ marginRight: 6 }} />
            ) : (
              <CheckCircle2 size={16} color={Colors.success} style={{ marginRight: 6 }} />
            )}
            <Text style={feedback.type === 'error' ? styles.errorText : styles.successText}>
              {feedback.message}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.surface} size="small" />
          ) : (
            <Text style={styles.submitText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>
    </CardWrapper>
  )
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#4ADE80',
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: Colors.success,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
})

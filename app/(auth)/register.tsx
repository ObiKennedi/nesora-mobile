// app/(auth)/register.tsx

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react-native'
import { CardWrapper } from '@/components/auth/CardWrapper'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius } from '@/constants/theme'

export default function RegisterScreen() {
  const { register } = useAuthStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  const handleRegister = async () => {
    setFeedback(null)

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields.' })
      return
    }

    if (password.length < 8) {
      setFeedback({ type: 'error', message: 'Password must be at least 8 characters long.' })
      return
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      router.replace('/(onboarding)/select-type' as any)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create account. Please try again.'
      setFeedback({ type: 'error', message: msg })

    } finally {
      setLoading(false)
    }
  }

  return (
    <CardWrapper
      heading="Create your account"
      subHeading="Join thousands of creators and fans on NESORA."
      showSocials
      showButton
      buttonLabel="Already have an account? Sign in"
      buttonLink="/(auth)/login"
    >
      <View style={styles.form}>
        {/* Name Fields Row */}
        <View style={styles.nameRow}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Ada"
              placeholderTextColor={Colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              editable={!loading}
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Okafor"
              placeholderTextColor={Colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
              editable={!loading}
            />
          </View>
        </View>

        {/* Email Field */}
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

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, styles.inputPw]}
              placeholder="Create a strong password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowPw((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPw ? (
                <EyeOff size={18} color={Colors.textSecondary} />
              ) : (
                <Eye size={18} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          <PasswordStrengthMeter passwordValue={password} />
        </View>

        {/* Confirm Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, styles.inputPw]}
              placeholder="Repeat your password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowConfirm((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showConfirm ? (
                <EyeOff size={18} color={Colors.textSecondary} />
              ) : (
                <Eye size={18} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Message */}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.surface} size="small" />
          ) : (
            <Text style={styles.submitText}>Create Account</Text>
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
  nameRow: {
    flexDirection: 'row',
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
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
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
  inputPw: {
    paddingRight: 44,
  },
  toggleBtn: {
    position: 'absolute',
    right: 14,
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

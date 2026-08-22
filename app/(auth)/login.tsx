// app/(auth)/login.tsx

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
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native'
import { CardWrapper } from '@/components/auth/CardWrapper'
import { useAuthStore } from '@/lib/auth'
import { Colors, Radius } from '@/constants/theme'

export default function LoginScreen() {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setErrorMessage(null)
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid email or password. Please try again.'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardWrapper
      heading="Welcome back"
      subHeading="Sign in to your NESORA account."
      showSocials
      showButton
      buttonLabel="Don't have an account? Sign up"
      buttonLink="/(auth)/register"
    >
      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="ada@example.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (errorMessage) setErrorMessage(null)
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            editable={!loading}
          />
        </View>

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, styles.inputPw, errorMessage ? styles.inputError : null]}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                if (errorMessage) setErrorMessage(null)
              }}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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
        </View>

        {/* Error Feedback */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={Colors.error} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.surface} size="small" />
          ) : (
            <Text style={styles.submitText}>Sign In</Text>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
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
  inputError: {
    borderColor: Colors.error,
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

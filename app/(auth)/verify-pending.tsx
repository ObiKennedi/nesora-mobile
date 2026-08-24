// app/(auth)/verify-pending.tsx — Email Verification Waiting Screen with Auto-Polling
import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Mail, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react-native'
import { CardWrapper } from '@/components/auth/CardWrapper'
import { Colors, Radius } from '@/constants/theme'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import * as SecureStore from 'expo-secure-store'

export default function VerifyPendingScreen() {
  const { email, password } = useLocalSearchParams<{ email: string; password?: string }>()
  const { login } = useAuthStore()

  const [isVerified, setIsVerified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current
  const checkAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Pulse animation on the email envelope
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()

    return () => pulse.stop()
  }, [])

  // ── Auto-poll verification status every 3.5 seconds ────────────────────────
  useEffect(() => {
    if (!email || isVerified) return

    const interval = setInterval(async () => {
      try {
        const { data } = await api.post('/auth/check-verification', {
          email: email.trim().toLowerCase(),
        })

        if (data?.verified) {
          clearInterval(interval)
          setIsVerified(true)

          // Trigger checkmark popup animation
          Animated.spring(checkAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start()

          // If tokens returned, store them and navigate
          if (data?.tokens?.accessToken) {
            await SecureStore.setItemAsync('accessToken', data.tokens.accessToken)
            await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken)
          } else if (password) {
            try {
              await login(email.trim().toLowerCase(), password)
            } catch (e) {
              console.log('Auto login fallback:', e)
            }
          }

          // Automatically disappear and navigate
          setTimeout(() => {
            if (data?.user?.onboardingType) {
              router.replace('/(fan)/feed' as any)
            } else {
              router.replace('/(onboarding)/select-type' as any)
            }
          }, 1200)
        }
      } catch (err) {
        // Silently continue polling
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [email, password, isVerified])

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email) return

    setResending(true)
    try {
      await api.post('/auth/resend-verification', { email: email.trim().toLowerCase() })
      setResendCooldown(30)
      Alert.alert('Verification Email Sent', 'We have sent a fresh verification link to your email.')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not resend email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <CardWrapper
      heading={isVerified ? 'Email Verified!' : 'Check your inbox'}
      subHeading={
        isVerified
          ? 'Your account is verified. Taking you to your feed…'
          : "We've sent a verification link to confirm your account."
      }
      showButton={false}
      buttonLink="/(auth)/login"
    >
      <View style={styles.container}>
        {/* ── Animated Icon Wrap ── */}
        <View style={styles.iconCircle}>
          {isVerified ? (
            <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
              <CheckCircle2 size={44} color={Colors.success} strokeWidth={2.4} />
            </Animated.View>
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Mail size={40} color={Colors.primary} strokeWidth={2} />
            </Animated.View>
          )}
        </View>

        {/* ── Highlighted Email Card ── */}
        <View style={styles.emailBox}>
          <Text style={styles.emailLabel}>Verification link sent to</Text>
          <Text style={styles.emailText} numberOfLines={1}>
            {email || 'your email'}
          </Text>
        </View>

        {/* ── Status Indicator ── */}
        <View style={styles.statusRow}>
          {isVerified ? (
            <Text style={styles.verifiedText}>✓ Account confirmed</Text>
          ) : (
            <>
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.waitingText}>Listening for verification link click…</Text>
            </>
          )}
        </View>

        {/* ── Resend & Back Actions ── */}
        {!isVerified && (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.resendBtn, (resendCooldown > 0 || resending) && styles.resendDisabled]}
              onPress={handleResend}
              disabled={resendCooldown > 0 || resending}
              activeOpacity={0.8}
            >
              {resending ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <RefreshCw size={15} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.resendText}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.backText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </CardWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#EFE6DB',
  },
  emailBox: {
    width: '100%',
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  waitingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  verifiedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '700',
  },
  actionGroup: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E6D7C8',
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  resendDisabled: {
    opacity: 0.6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
})

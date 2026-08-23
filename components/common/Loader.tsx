// components/common/Loader.tsx
import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Colors } from '@/constants/theme'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface LoaderProps {
  message?: string
  fullscreen?: boolean
  dark?: boolean
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading…',
  fullscreen = true,
  dark = true,
}) => {
  // ── Animation Values ────────────────────────────────────────────────────────
  const spinCwAnim = useRef(new Animated.Value(0)).current
  const spinCcwAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(0)).current
  const bloomAnim = useRef(new Animated.Value(0)).current
  const logoAnim = useRef(new Animated.Value(0)).current
  const taglineAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // 1. Clockwise outer ring spin (8s)
    const spinCw = Animated.loop(
      Animated.timing(spinCwAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    // 2. Counter-clockwise inner ring spin (5s)
    const spinCcw = Animated.loop(
      Animated.timing(spinCcwAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    // 3. Expanding pulse ring (2s)
    const pulse = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    )

    // 4. Background bloom breathing (3s)
    const bloom = Animated.loop(
      Animated.sequence([
        Animated.timing(bloomAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bloomAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    // 5. Center logo breathing (2.8s)
    const logo = Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    // 6. Bottom tagline breathing (3.5s)
    const tagline = Animated.loop(
      Animated.sequence([
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(taglineAnim, {
          toValue: 0,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    spinCw.start()
    spinCcw.start()
    pulse.start()
    bloom.start()
    logo.start()
    tagline.start()

    return () => {
      spinCw.stop()
      spinCcw.stop()
      pulse.stop()
      bloom.stop()
      logo.stop()
      tagline.stop()
    }
  }, [])

  // Interpolations
  const spinCwInterpolate = spinCwAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const spinCcwInterpolate = spinCcwAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  })

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.88, 1.12, 0.88],
  })

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.7, 0, 0],
  })

  const bloomScale = bloomAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  })

  const bloomOpacity = bloomAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  })

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  })

  const logoOpacity = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  })

  const glowScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.18],
  })

  const glowOpacity = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  })

  const taglineOpacity = taglineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.45],
  })

  const emblemSize = fullscreen ? 124 : 76
  const logoHeight = fullscreen ? 42 : 26

  const containerBg = dark ? '#111110' : Colors.bg
  const textColor = dark ? 'rgba(255, 255, 255, 0.5)' : Colors.textSecondary
  const tagColor = dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.3)'

  return (
    <View
      style={[
        fullscreen ? styles.fullscreenContainer : styles.inlineContainer,
        { backgroundColor: fullscreen ? containerBg : 'transparent' },
      ]}
    >
      {fullscreen && <StatusBar barStyle="light-content" backgroundColor={containerBg} />}

      {/* ── Background Glow Bloom ── */}
      {fullscreen && (
        <Animated.View
          style={[
            styles.bloom,
            {
              transform: [{ scale: bloomScale }],
              opacity: bloomOpacity,
            },
          ]}
        />
      )}

      {/* ── Decorative Corner Accents ── */}
      {fullscreen && (
        <>
          {/* Top Left */}
          <View style={[styles.corner, styles.cornerTL]}>
            <View style={[styles.cornerLineH, { backgroundColor: Colors.primary }]} />
            <View style={[styles.cornerLineV, { backgroundColor: Colors.primary }]} />
          </View>
          {/* Top Right */}
          <View style={[styles.corner, styles.cornerTR]}>
            <View style={[styles.cornerLineH, { backgroundColor: Colors.primary }]} />
            <View style={[styles.cornerLineV, { backgroundColor: Colors.primary }]} />
          </View>
          {/* Bottom Left */}
          <View style={[styles.corner, styles.cornerBL]}>
            <View style={[styles.cornerLineH, { backgroundColor: Colors.primary }]} />
            <View style={[styles.cornerLineV, { backgroundColor: Colors.primary }]} />
          </View>
          {/* Bottom Right */}
          <View style={[styles.corner, styles.cornerBR]}>
            <View style={[styles.cornerLineH, { backgroundColor: Colors.primary }]} />
            <View style={[styles.cornerLineV, { backgroundColor: Colors.primary }]} />
          </View>
        </>
      )}

      {/* ── Center Emblem & Ring Animation ── */}
      <View style={styles.centerWrap}>
        <View style={[styles.emblem, { width: emblemSize, height: emblemSize }]}>
          {/* Outer Dashed Rotating Ring (Clockwise) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { transform: [{ rotate: spinCwInterpolate }] },
            ]}
          >
            <Svg width={emblemSize} height={emblemSize} viewBox="0 0 100 100">
              <Defs>
                <LinearGradient id="ringGrad" x1="0" y1="0.5" x2="1" y2="0.5">
                  <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.1" />
                  <Stop offset="0.5" stopColor={Colors.primary} stopOpacity="0.95" />
                  <Stop offset="1" stopColor={Colors.primary} stopOpacity="0.1" />
                </LinearGradient>
              </Defs>
              <Circle
                cx="50"
                cy="50"
                r="46"
                stroke="url(#ringGrad)"
                strokeWidth="1.2"
                strokeDasharray="3.5, 7"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Inner Dashed Rotating Ring (Counter-Clockwise) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { transform: [{ rotate: spinCcwInterpolate }] },
            ]}
          >
            <Svg width={emblemSize} height={emblemSize} viewBox="0 0 100 100">
              <Circle
                cx="50"
                cy="50"
                r="34"
                stroke={Colors.primary}
                strokeOpacity="0.3"
                strokeWidth="0.9"
                strokeDasharray="2.5, 7"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Expanding Pulsing Ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: Colors.primary,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />

          {/* Ambient Logo Glow */}
          <Animated.View
            style={[
              styles.logoGlow,
              {
                backgroundColor: Colors.primary,
                transform: [{ scale: glowScale }],
                opacity: glowOpacity,
              },
            ]}
          />

          {/* Center Nesora Logo */}
          <Animated.View
            style={[
              styles.logoWrap,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Image
              source={require('@/assets/logo.png')}
              style={{
                height: logoHeight,
                width: logoHeight * 2.2,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>
        </View>

        {/* ── Status Message ── */}
        {message ? (
          <Text
            style={[
              styles.message,
              {
                color: textColor,
                fontSize: fullscreen ? 13 : 11,
              },
            ]}
          >
            {message}
          </Text>
        ) : null}
      </View>

      {/* ── Tagline at bottom ── */}
      {fullscreen && (
        <Animated.Text
          style={[
            styles.tagline,
            {
              color: tagColor,
              opacity: taglineOpacity,
            },
          ]}
        >
          CREATE · CONNECT · EARN
        </Animated.Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inlineContainer: {
    width: '100%',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  bloom: {
    position: 'absolute',
    width: Math.min(SCREEN_WIDTH * 1.2, 450),
    height: Math.min(SCREEN_WIDTH * 1.2, 450),
    borderRadius: 250,
    backgroundColor: 'rgba(194, 98, 42, 0.12)',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cornerLineH: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    opacity: 0.5,
  },
  cornerLineV: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1.5,
    opacity: 0.5,
  },
  cornerTL: {
    top: 36,
    left: 32,
  },
  cornerTR: {
    top: 36,
    right: 32,
    transform: [{ scaleX: -1 }],
  },
  cornerBL: {
    bottom: 36,
    left: 32,
    transform: [{ scaleY: -1 }],
  },
  cornerBR: {
    bottom: 36,
    right: 32,
    transform: [{ scaleX: -1 }, { scaleY: -1 }],
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: '84%',
    height: '84%',
    borderRadius: 9999,
    borderWidth: 1.2,
  },
  logoGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  message: {
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
  },
})

export default Loader

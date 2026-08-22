// components/auth/PasswordStrengthMeter.tsx

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

interface PasswordStrengthMeterProps {
  passwordValue: string
}

const getStrength = (pw: string) => {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['', '#B94040', '#D4A017', '#4A7C59', Colors.primary]

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ passwordValue }) => {
  if (!passwordValue || passwordValue.length === 0) return null

  const strength = getStrength(passwordValue)

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: i <= strength ? strengthColors[strength] : '#E0DDD9',
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strengthColors[strength] || Colors.textMuted }]}>
        {strengthLabels[strength]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
    marginBottom: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
})

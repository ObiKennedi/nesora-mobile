// app/(auth)/forgot-password.tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { api } from '@/lib/api'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email.'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      Alert.alert('Email sent', 'Check your inbox for a password reset link.', [
        { text: 'Back to Login', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.root}>
      <TouchableOpacity style={s.back} onPress={() => router.back()}><Text style={s.backText}>← Back</Text></TouchableOpacity>
      <Text style={s.title}>Forgot Password</Text>
      <Text style={s.sub}>Enter your email and we'll send you a reset link.</Text>
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Reset Link</Text>}
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a', paddingHorizontal: 28, paddingTop: 80 },
  back: { marginBottom: 32 }, backText: { color: '#a855f7', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 12 },
  sub: { color: '#888', fontSize: 15, marginBottom: 32 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 24 },
  btn: { backgroundColor: '#a855f7', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 }, btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

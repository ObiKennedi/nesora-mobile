// app/(auth)/login.tsx

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/lib/auth'

export default function LoginScreen() {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please enter your email and password.'); return }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid credentials. Please try again.'
      Alert.alert('Login Failed', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <Text style={s.logo}>NESORA</Text>
        <Text style={s.subtitle}>Sign in to continue</Text>

        <TextInput
          style={s.input}
          placeholder="Email" placeholderTextColor="#666"
          value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" returnKeyType="next"
        />
        <TextInput
          style={s.input}
          placeholder="Password" placeholderTextColor="#666"
          value={password} onChangeText={setPassword}
          secureTextEntry returnKeyType="done" onSubmitEditing={handleLogin}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={s.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={s.switchText}>Don't have an account? <Text style={s.link}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 4, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 16,
  },
  forgotText: { color: '#a855f7', textAlign: 'right', marginBottom: 24, fontSize: 14 },
  btn: { backgroundColor: '#a855f7', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { color: '#666', textAlign: 'center', fontSize: 14 },
  link: { color: '#a855f7', fontWeight: '600' },
})

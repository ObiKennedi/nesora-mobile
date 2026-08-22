// app/(auth)/register.tsx

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { api } from '@/lib/api'

export default function RegisterScreen() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      Alert.alert('Error', 'Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      Alert.alert('Check your email', 'We sent you a verification link. Verify your email then sign in.', [
        { text: 'Sign In', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>NESORA</Text>
        <Text style={s.subtitle}>Create your account</Text>

        {(['firstName', 'lastName', 'email', 'password'] as const).map((field) => (
          <TextInput
            key={field}
            style={s.input}
            placeholder={field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'email' ? 'Email' : 'Password'}
            placeholderTextColor="#666"
            value={form[field]}
            onChangeText={set(field)}
            autoCapitalize={field === 'email' || field === 'password' ? 'none' : 'words'}
            keyboardType={field === 'email' ? 'email-address' : 'default'}
            secureTextEntry={field === 'password'}
            returnKeyType="next"
          />
        ))}

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.switchText}>Already have an account? <Text style={s.link}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 4, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 16,
  },
  btn: { backgroundColor: '#a855f7', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24, marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { color: '#666', textAlign: 'center', fontSize: 14 },
  link: { color: '#a855f7', fontWeight: '600' },
})

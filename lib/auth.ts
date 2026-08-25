// lib/auth.ts — Zustand auth store

import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from './api'

export type AuthUser = {
  id: string
  email: string
  name: string
  username: string | null
  image: string | null
  role: 'USER' | 'ADMIN'
  onboardingType: 'FAN' | 'CREATOR' | null
}

type RegisterPayload = {
  email: string
  password: string
  firstName: string
  lastName: string
}

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  activeMode: 'FAN' | 'CREATOR'
  setActiveMode: (mode: 'FAN' | 'CREATOR') => Promise<void>
  login: (email: string, password: string) => Promise<void>
  googleLogin: (payload: {
    email: string
    name?: string
    image?: string
    googleId?: string
    idToken?: string
  }) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  activeMode: 'FAN',

  setActiveMode: async (mode) => {
    await SecureStore.setItemAsync('activeMode', mode)
    set({ activeMode: mode })
  },


  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    const initialMode = data.user?.onboardingType === 'CREATOR' ? 'CREATOR' : 'FAN'
    await SecureStore.setItemAsync('activeMode', initialMode)
    set({ user: data.user, isAuthenticated: true, activeMode: initialMode })
  },

  googleLogin: async (payload) => {
    const { data } = await api.post('/auth/google', payload)
    if (data.accessToken) {
      await SecureStore.setItemAsync('accessToken', data.accessToken)
    }
    if (data.refreshToken) {
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    }
    const initialMode = data.user?.onboardingType === 'CREATOR' ? 'CREATOR' : 'FAN'
    await SecureStore.setItemAsync('activeMode', initialMode)
    set({ user: data.user, isAuthenticated: true, activeMode: initialMode })
    return data.user
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    if (data.accessToken) {
      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)
      set({ user: data.user, isAuthenticated: true, activeMode: 'FAN' })
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    await SecureStore.deleteItemAsync('activeMode')
    set({ user: null, isAuthenticated: false, activeMode: 'FAN' })
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken')
      if (!token) {
        set({ isLoading: false, isAuthenticated: false })
        return
      }
      const { data } = await api.get('/auth/me')
      const storedMode = await SecureStore.getItemAsync('activeMode')
      const resolvedMode = (storedMode === 'CREATOR' || storedMode === 'FAN')
        ? storedMode
        : (data.onboardingType === 'CREATOR' ? 'CREATOR' : 'FAN')

      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
        activeMode: resolvedMode,
      })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  setUser: (user) => set({ user }),
}))


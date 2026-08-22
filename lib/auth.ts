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
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    set({ user: data.user, isAuthenticated: true })
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    if (data.accessToken) {
      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)
      set({ user: data.user, isAuthenticated: true })
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken')
      if (!token) {
        set({ isLoading: false, isAuthenticated: false })
        return
      }
      const { data } = await api.get('/auth/me')
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  setUser: (user) => set({ user }),
}))

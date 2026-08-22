// lib/api.ts — Axios client that auto-attaches JWT and handles refresh

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://nesora-api-xi.vercel.app/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
})

// Attach access token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: string) => void; reject: (err: any) => void }> = []

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
        await SecureStore.setItemAsync('accessToken', data.accessToken)
        await SecureStore.setItemAsync('refreshToken', data.refreshToken)

        processQueue(null, data.accessToken)
        originalRequest.headers!.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        await SecureStore.deleteItemAsync('accessToken')
        await SecureStore.deleteItemAsync('refreshToken')
        // The auth store's checkAuth will pick up the missing token and redirect to login
        throw err
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

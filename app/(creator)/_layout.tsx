// app/(creator)/_layout.tsx — Creator Bottom Tab Navigator
import React from 'react'
import { Tabs } from 'expo-router'
import {
  LayoutGrid,
  FileText,
  Users,
  MessageCircle,
  Wallet,
} from 'lucide-react-native'
import { Colors } from '@/constants/theme'

export default function CreatorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EBE7E0',
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 1,
          letterSpacing: -0.1,
        },
      }}
    >
      {/* ── 1. Home / Dashboard ── */}
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── 2. Content ── */}
      <Tabs.Screen
        name="content/index"
        options={{
          title: 'Content',
          tabBarIcon: ({ color, focused }) => (
            <FileText
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── 3. Audience ── */}
      <Tabs.Screen
        name="audience/index"
        options={{
          title: 'Audience',
          tabBarIcon: ({ color, focused }) => (
            <Users
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── 4. Messages ── */}
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── 5. Wallet ── */}
      <Tabs.Screen
        name="wallet/index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <Wallet
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  )
}


// app/(fan)/_layout.tsx — Bottom tab navigator matching NESORA screenshot design
import React from 'react'
import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import {
  Home,
  Compass,
  Plus,
  MessageCircle,
  User,
} from 'lucide-react-native'
import { Colors } from '@/constants/theme'

function CenterPlusButton() {
  return (
    <View style={styles.plusWrapper}>
      <View style={styles.plusCircle}>
        <Plus size={22} color="#FFFFFF" strokeWidth={2.8} />
      </View>
    </View>
  )
}

export default function FanTabLayout() {
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
      {/* ── 1. Home Feed ── */}
      <Tabs.Screen
        name="feed/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── 2. Explore / Discover ── */}
      <Tabs.Screen
        name="discover/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Compass
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── 3. Center Create Action Button ── */}
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: () => <CenterPlusButton />,
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

      {/* ── 5. You (Profile & Settings) ── */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={20}
              color={color}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />

      {/* ── Hidden Stack Screens ── */}
      <Tabs.Screen
        name="feed/shorts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="messages/[conversationId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/[username]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/billing"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/liked"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/saved"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/wallet"
        options={{
          href: null,
        }}
      />
    </Tabs>

  )
}

const styles = StyleSheet.create({
  plusWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -6,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
})


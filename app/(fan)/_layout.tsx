// app/(fan)/_layout.tsx — Bottom tab navigator matching NESORA screenshot design
import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import {
  Home,
  Compass,
  Plus,
  MessageCircle,
  User,
} from 'lucide-react-native'
import { Colors } from '@/constants/theme'

function TabIcon({
  icon: IconComponent,
  label,
  focused,
}: {
  icon: any
  label: string
  focused: boolean
}) {
  return (
    <View style={styles.tab}>
      <IconComponent
        size={22}
        color={focused ? Colors.primary : '#94A3B8'}
        strokeWidth={focused ? 2.3 : 1.8}
      />
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  )
}

function CenterPlusButton() {
  return (
    <View style={styles.plusWrapper}>
      <View style={styles.plusCircle}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
      </View>
    </View>
  )
}

export default function FanTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EBE7E0',
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* ── 1. Home Feed ── */}
      <Tabs.Screen
        name="feed/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home} label="Home" focused={focused} />
          ),
        }}
      />

      {/* ── 2. Explore / Discover ── */}
      <Tabs.Screen
        name="discover/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Compass} label="Explore" focused={focused} />
          ),
        }}
      />

      {/* ── 3. Center Create Action Button ── */}
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: () => <CenterPlusButton />,
        }}
      />

      {/* ── 4. Messages ── */}
      <Tabs.Screen
        name="messages/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={MessageCircle} label="Messages" focused={focused} />
          ),
        }}
      />

      {/* ── 5. You (Profile & Settings) ── */}
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} label="You" focused={focused} />
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
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  label: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '500',
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
  plusWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -4,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
})

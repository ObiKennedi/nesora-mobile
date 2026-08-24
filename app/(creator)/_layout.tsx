// app/(creator)/_layout.tsx — Creator Bottom Tab Navigator
import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import {
  LayoutGrid,
  FileText,
  Users,
  MessageCircle,
  Wallet,
} from 'lucide-react-native'
import { Colors } from '@/constants/theme'

function CreatorTabIcon({
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

export default function CreatorTabLayout() {
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
      {/* ── 1. Home / Dashboard ── */}
      <Tabs.Screen
        name="dashboard/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CreatorTabIcon icon={LayoutGrid} label="Home" focused={focused} />
          ),
        }}
      />

      {/* ── 2. Content ── */}
      <Tabs.Screen
        name="content/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CreatorTabIcon icon={FileText} label="Content" focused={focused} />
          ),
        }}
      />

      {/* ── 3. Audience ── */}
      <Tabs.Screen
        name="audience/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CreatorTabIcon icon={Users} label="Audience" focused={focused} />
          ),
        }}
      />

      {/* ── 4. Messages ── */}
      <Tabs.Screen
        name="messages/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CreatorTabIcon icon={MessageCircle} label="Messages" focused={focused} />
          ),
        }}
      />

      {/* ── 5. Wallet ── */}
      <Tabs.Screen
        name="wallet/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CreatorTabIcon icon={Wallet} label="Wallet" focused={focused} />
          ),
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
})

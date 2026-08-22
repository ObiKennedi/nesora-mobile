// app/(fan)/_layout.tsx — Bottom tab navigator

import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[s.tab, focused && s.tabFocused]}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, focused && s.labelFocused]}>{label}</Text>
    </View>
  )
}

export default function FanTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopWidth: 1,
          borderTopColor: '#1a1a1a',
          height: 80,
          paddingBottom: 16,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Feed" focused={focused} /> }}
      />
      <Tabs.Screen
        name="feed/shorts"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="▶️" label="Shorts" focused={focused} /> }}
      />
      <Tabs.Screen
        name="discover/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Discover" focused={focused} /> }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="Messages" focused={focused} /> }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Alerts" focused={focused} /> }}
      />
    </Tabs>
  )
}

const s = StyleSheet.create({
  tab: { alignItems: 'center', paddingTop: 8 },
  tabFocused: {},
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: '#555', marginTop: 4 },
  labelFocused: { color: '#a855f7' },
})

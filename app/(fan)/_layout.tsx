// app/(fan)/_layout.tsx — Bottom tab navigator matching NESORA web app branding

import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Home, Play, Search, MessageSquare, Bell } from 'lucide-react-native'
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
        color={focused ? Colors.primary : Colors.textMuted}
        strokeWidth={focused ? 2.3 : 1.8}
      />
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  )
}

export default function FanTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} label="Feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed/shorts"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Play} label="Shorts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="discover/index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Search} label="Discover" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={MessageSquare} label="Messages" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Bell} label="Alerts" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
})

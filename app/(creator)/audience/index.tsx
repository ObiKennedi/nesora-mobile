// app/(creator)/audience/index.tsx — Creator Audience & Subscribers
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Users, UserCheck } from 'lucide-react-native'
import { Colors } from '@/constants/theme'

export default function CreatorAudienceScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audience</Text>
      </View>

      <View style={styles.emptyContainer}>
        <View style={styles.iconWrap}>
          <Users size={32} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Build your audience</Text>
        <Text style={styles.emptySubtitle}>
          Share your profile link to attract followers and paying subscribers.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F2EE',
  },
  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F6ECE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
})

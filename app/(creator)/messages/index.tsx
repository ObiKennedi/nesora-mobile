// app/(creator)/messages/index.tsx — Creator Direct Messages
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MessageCircle } from 'lucide-react-native'
import { Colors } from '@/constants/theme'

export default function CreatorMessagesScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fan Messages</Text>
      </View>

      <View style={styles.emptyContainer}>
        <View style={styles.iconWrap}>
          <MessageCircle size={32} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptySubtitle}>
          Direct messages and paid tip interactions with your fans will appear here.
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

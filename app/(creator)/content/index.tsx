// app/(creator)/content/index.tsx — Creator Content Management
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { Plus, Image as ImageIcon, Video, Eye } from 'lucide-react-native'
import { Colors } from '@/constants/theme'

export default function CreatorContentScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Content</Text>
        <TouchableOpacity style={styles.createBtn} activeOpacity={0.8}>
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.createBtnText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyContainer}>
        <View style={styles.iconWrap}>
          <ImageIcon size={32} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No posts published yet</Text>
        <Text style={styles.emptySubtitle}>
          Start publishing exclusive photos, videos, and updates for your subscribers.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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

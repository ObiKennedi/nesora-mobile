// app/(fan)/create.tsx — Quick create post / story modal trigger
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Image, Video, Radio, Sparkles, X } from 'lucide-react-native'
import { Colors } from '@/constants/theme'

export default function CreateModalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Create on NESORA</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color="#718096" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.option} activeOpacity={0.8}>
          <View style={[styles.iconWrap, { backgroundColor: '#F6ECE2' }]}>
            <Image size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.optionTitle}>New Post</Text>
            <Text style={styles.optionDesc}>Share photos and thoughts with your fans</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} activeOpacity={0.8}>
          <View style={[styles.iconWrap, { backgroundColor: '#E0F2FE' }]}>
            <Video size={20} color="#0284C7" />
          </View>
          <View>
            <Text style={styles.optionTitle}>Upload Short</Text>
            <Text style={styles.optionDesc}>Share a quick video clip</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} activeOpacity={0.8}>
          <View style={[styles.iconWrap, { backgroundColor: '#FCE7F3' }]}>
            <Radio size={20} color="#DB2777" />
          </View>
          <View>
            <Text style={styles.optionTitle}>Go Live</Text>
            <Text style={styles.optionDesc}>Start an interactive live broadcast</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  closeBtn: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFEA',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  optionDesc: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
})

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{user?.firstName ?? 'Student'} {user?.lastName ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email ?? 'student@sophia.example'}</Text>
        <Text style={styles.meta}>{user?.institution ?? 'University of Lagos'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Uploads</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>850</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={signOut}>
        <Text style={styles.primaryButtonText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  name: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    color: '#94A3B8',
    marginTop: 6,
  },
  meta: {
    color: '#A5B4FC',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

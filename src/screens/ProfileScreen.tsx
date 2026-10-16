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

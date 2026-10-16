import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PointsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wisdom Points</Text>
      <Text style={styles.balance}>850</Text>

      <Text style={styles.section}>Earned</Text>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Uploaded lecture notes</Text>
        <Text style={styles.cardValue}>+120</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Referred a friend</Text>
        <Text style={styles.cardValue}>+50</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  balance: {
    color: '#A5B4FC',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 28,
  },
  section: {
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  cardValue: {
    color: '#34D399',
    marginTop: 8,
    fontWeight: '700',
    fontSize: 18,
  },
});

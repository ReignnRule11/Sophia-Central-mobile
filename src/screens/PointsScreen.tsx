import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const transactions = [
  { id: '1', label: 'Uploaded lecture notes', value: '+120' },
  { id: '2', label: 'Referred a friend', value: '+50' },
  { id: '3', label: 'AI summary', value: '-5' },
];

export default function PointsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wisdom Points</Text>
      <Text style={styles.balance}>850</Text>

      <Text style={styles.section}>Recent activity</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={[styles.cardValue, { color: item.value.startsWith('+') ? '#34D399' : '#FCA5A5' }]}>{item.value}</Text>
          </View>
        )}
      />
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
    marginBottom: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  cardValue: {
    fontWeight: '700',
    fontSize: 18,
  },
});

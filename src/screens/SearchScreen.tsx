import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { mockResources } from '../data/mockData';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const { data } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/resources');
        const payload = response.data?.data ?? response.data ?? mockResources;
        return Array.isArray(payload) ? payload : payload.items ?? mockResources;
      } catch (_error) {
        return mockResources;
      }
    },
  });

  const resources = useMemo(() => (Array.isArray(data) ? data : mockResources), [data]);

  const filtered = query
    ? resources.filter((item: any) => {
        const haystack = `${item.title} ${item.course ?? ''} ${item.topic ?? ''} ${item.type ?? ''}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : resources;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search course, notes, topic..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ResourceDetail', { resource: item })}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.type ?? 'Resource'}</Text>
              <Text style={styles.meta}>{item.institution ?? 'Institution'}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0B1220',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    color: '#94A3B8',
    marginBottom: 2,
  },
});

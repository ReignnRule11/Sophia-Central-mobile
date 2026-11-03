import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { searchResources } from '../services/resources';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const search = useQuery({
    queryKey: ['resource-search', query.trim()],
    queryFn: () => searchResources(query.trim() ? { q: query.trim() } : {}),
    enabled: query.trim().length >= 2,
  });
  const items = search.data ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses, notes, topics..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.trim().length < 2 ? <Text style={styles.hint}>Enter at least two characters to search the academic library.</Text> : null}
        {search.isFetching ? <ActivityIndicator color="#A5B4FC" style={{ margin: 16 }} /> : null}
        {search.isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.empty}>Search is temporarily unavailable.</Text>
            <TouchableOpacity onPress={() => void search.refetch()}><Text style={styles.retry}>Try again</Text></TouchableOpacity>
          </View>
        ) : null}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={query.trim().length >= 2 && !search.isFetching && !search.isError ? <Text style={styles.empty}>No matching approved resources found.</Text> : null}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ResourceDetail', { resource: item })}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.type ?? 'Academic resource'}{item.course ? ` · ${item.course}` : ''}</Text>
              <Text style={styles.meta}>{item.institution ?? ''}{item.level ? ` · Level ${item.level}` : ''}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1220' },
  container: { flex: 1, padding: 20, backgroundColor: '#0B1220' },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  input: { backgroundColor: '#111827', color: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1F2937', marginBottom: 12 },
  hint: { color: '#64748B', marginBottom: 16 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  cardTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#94A3B8', marginBottom: 2 },
  empty: { color: '#94A3B8', textAlign: 'center', padding: 24 },
  stateCard: { backgroundColor: '#111827', borderRadius: 14, padding: 12 },
  retry: { color: '#A5B4FC', textAlign: 'center', fontWeight: '700', padding: 8 },
});

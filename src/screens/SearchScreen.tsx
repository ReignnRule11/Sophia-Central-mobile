import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchResources } from '../services/resources';
import { mockResources } from '../data/mockData';

const typeOptions = ['All', 'Past Questions', 'Lecture Notes', 'Research Paper', 'Course Notes'];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data, isLoading } = useQuery({
    queryKey: ['resources', query, selectedType, page],
    queryFn: async () => fetchResources({
      search: query || undefined,
      type: selectedType === 'All' ? undefined : selectedType,
      page,
      limit: pageSize,
    }),
  });

  const resources = useMemo(() => (data?.items?.length ? data.items : mockResources), [data]);
  const totalPages = Math.max(1, Number(data?.totalPages ?? 1));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover</Text>

        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setPage(1);
          }}
          placeholder="Search courses, notes, and topics..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={typeOptions}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedType === item && styles.chipActive]}
              onPress={() => {
                setSelectedType(item);
                setPage(1);
              }}
            >
              <Text style={[styles.chipText, selectedType === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        {isLoading ? (
          <Text style={styles.empty}>Loading resources...</Text>
        ) : (
          <>
            <FlatList
              data={resources}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ResourceDetail', { resource: item })}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.meta}>{item.type ?? 'Resource'}</Text>
                  <Text style={styles.meta}>{item.institution ?? 'Institution'}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>No resources match your search.</Text>}
            />

            <View style={styles.paginationRow}>
              <TouchableOpacity
                style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                <Text style={styles.pageButtonText}>Prev</Text>
              </TouchableOpacity>

              <Text style={styles.pageText}>Page {page} of {totalPages}</Text>

              <TouchableOpacity
                style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
                onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  chipsList: {
    paddingBottom: 14,
  },
  chip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#8B5CF6',
  },
  chipText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingBottom: 12,
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
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  pageButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  pageText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  empty: {
    color: '#94A3B8',
    marginTop: 12,
  },
});

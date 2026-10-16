import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { useNavigation } from '@react-navigation/native';

type Resource = {
  id: string;
  title: string;
  course?: string;
  topic?: string;
  institution?: string;
  type?: string;
  description?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await apiClient.get('/resources');
      return response.data?.data ?? response.data;
    },
  });

  const resources: Resource[] = Array.isArray(data) ? data : data?.items ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Academic Library</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Upload')}>
          <Text style={styles.action}>Upload</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.pointsCard} onPress={() => navigation.navigate('Points')}>
        <Text style={styles.pointsLabel}>Wisdom Points</Text>
        <Text style={styles.pointsValue}>850</Text>
      </TouchableOpacity>

      {isLoading ? (
        <Text style={styles.empty}>Loading resources...</Text>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.course ?? 'General'} • {item.institution ?? 'Institution'}</Text>
              <Text style={styles.meta}>{item.type ?? 'Other'} • {item.topic ?? 'Topic'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No resources yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  action: {
    color: '#A5B4FC',
    fontWeight: '600',
  },
  pointsCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  pointsLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  pointsValue: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    color: '#94A3B8',
    marginBottom: 4,
  },
  empty: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },
});

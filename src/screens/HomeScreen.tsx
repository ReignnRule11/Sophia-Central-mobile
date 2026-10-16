import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';

const mockTrending = [
  { id: '1', title: 'Data Structures', institution: 'University of Lagos', type: 'Past Questions' },
  { id: '2', title: 'Organic Chemistry', institution: 'University of Ibadan', type: 'Lecture Notes' },
  { id: '3', title: 'Research Methods', institution: 'Federal University of Technology', type: 'Research Paper' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/resources');
        return response.data?.data ?? response.data ?? [];
      } catch (error) {
        return [];
      }
    },
  });

  const resources = Array.isArray(data) ? data : data?.items ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Good evening</Text>
          <Text style={styles.title}>Sophia Central</Text>
        </View>
        <TouchableOpacity style={styles.badge} onPress={() => navigation.navigate('Points')}>
          <Text style={styles.badgeText}>850 pts</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchCard} onPress={() => navigation.navigate('Discover')}>
        <Text style={styles.searchText}>Search courses, notes, papers...</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Trending now</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={mockTrending}
        contentContainerStyle={{ paddingRight: 12 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trendCard} onPress={() => navigation.navigate('Discover')}>
            <Text style={styles.trendType}>{item.type}</Text>
            <Text style={styles.trendTitle}>{item.title}</Text>
            <Text style={styles.trendMeta}>{item.institution}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Recently added</Text>
      {isLoading ? (
        <Text style={styles.empty}>Loading resources...</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {(resources.length ? resources : mockTrending).map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resourceCard}
              onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
            >
              <Text style={styles.resourceTitle}>{item.title}</Text>
              <Text style={styles.resourceMeta}>{item.course ?? item.institution ?? 'General'} • {item.type ?? 'Resource'}</Text>
              <Text style={styles.resourceMeta}>{item.topic ?? 'Academic material'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1F2937',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  searchCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  searchText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  trendCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    width: 220,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  trendType: {
    color: '#A5B4FC',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  trendTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  trendMeta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  resourceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 18,
  },
  resourceTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  resourceMeta: {
    color: '#94A3B8',
  },
  empty: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 22,
  },
});
